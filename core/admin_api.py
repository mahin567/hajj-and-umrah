"""Private API for the React admin panel (/api/manage/...).

Everything here needs a staff account. Sign in with POST /api/manage/login/ to get a token,
then send it as  Authorization: Token <key>.  The public website never calls these endpoints.
Tokens expire after ADMIN_TOKEN_TTL_HOURS (default 12).
"""
import csv
from datetime import timedelta

from django.conf import settings
from django.contrib.auth import authenticate
from django.db.models import Q
from django.http import HttpResponse
from django.utils import timezone
from rest_framework import exceptions, mixins, permissions, serializers, viewsets
from rest_framework.authentication import TokenAuthentication
from rest_framework.authtoken.models import Token
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView

from .models import Appointment, Enquiry, Package, Review


class ExpiringTokenAuthentication(TokenAuthentication):
    def authenticate_credentials(self, key):
        user, token = super().authenticate_credentials(key)
        if token.created < timezone.now() - timedelta(hours=settings.ADMIN_TOKEN_TTL_HOURS):
            token.delete()
            raise exceptions.AuthenticationFailed("Session expired. Please sign in again.")
        return user, token


STAFF = {"authentication_classes": [ExpiringTokenAuthentication], "permission_classes": [permissions.IsAdminUser]}


class StaffMixin:
    authentication_classes = STAFF["authentication_classes"]
    permission_classes = STAFF["permission_classes"]


class LoginView(APIView):
    authentication_classes = []
    permission_classes = [permissions.AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "admin_login"  # slows down password guessing

    def post(self, request):
        user = authenticate(username=str(request.data.get("username", "")), password=str(request.data.get("password", "")))
        if not user or not user.is_staff or not user.is_active:
            return Response({"detail": "Wrong username or password."}, status=400)
        Token.objects.filter(user=user).delete()  # fresh token on every sign-in, so old ones stop working
        token = Token.objects.create(user=user)
        return Response({"token": token.key, "username": user.get_username()})


class LogoutView(StaffMixin, APIView):
    def post(self, request):
        Token.objects.filter(user=request.user).delete()
        return Response(status=204)


class MeView(StaffMixin, APIView):
    def get(self, request):
        return Response({"username": request.user.get_username()})


# ------------------------------------------------------------------ serializers
class PackageAdminSerializer(serializers.ModelSerializer):
    class Meta:
        model = Package
        fields = "__all__"
        read_only_fields = ["created_at", "updated_at"]


class EnquiryAdminSerializer(serializers.ModelSerializer):
    package_title = serializers.CharField(source="package.title", read_only=True, default="")

    class Meta:
        model = Enquiry
        fields = "__all__"
        read_only_fields = ["name", "phone", "email", "kind", "package", "message", "created_at", "updated_at"]  # staff change status + note only


class AppointmentAdminSerializer(serializers.ModelSerializer):
    class Meta:
        model = Appointment
        fields = "__all__"
        read_only_fields = ["name", "phone", "kind", "consultation_type", "preferred_at", "travellers", "message", "created_at", "updated_at"]


class ReviewAdminSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = "__all__"
        read_only_fields = ["name", "rating", "text", "created_at"]  # only approve / unapprove


# ------------------------------------------------------------------ viewsets
class FilterMixin:
    """?status=new  ?kind=hajj  ?search=text  ?approved=0|1  (all optional, combinable)."""

    filter_fields = ("status", "kind")
    search_fields = ()

    def get_queryset(self):
        qs = super().get_queryset()
        q = self.request.query_params
        for f in self.filter_fields:
            if q.get(f):
                qs = qs.filter(**{f: q[f]})
        if "approved" in self.filter_fields and q.get("approved") in {"0", "1"}:
            qs = qs.filter(approved=q["approved"] == "1")
        term = q.get("search", "").strip()
        if term and self.search_fields:
            cond = Q()
            for f in self.search_fields:
                cond |= Q(**{f"{f}__icontains": term})
            qs = qs.filter(cond)
        return qs


def _csv_cell(v):
    """Stop spreadsheet formula injection: a cell starting with = + - @ would run as a formula in Excel."""
    s = "" if v is None else str(v)
    return "'" + s if s[:1] in "=+-@\t\r" else s


class CsvExportMixin:
    csv_columns = ()

    @action(detail=False, methods=["get"], url_path="export")
    def export(self, request):
        resp = HttpResponse(content_type="text/csv; charset=utf-8")
        resp["Content-Disposition"] = f'attachment; filename="{self.basename.replace("manage-", "")}-{timezone.localdate()}.csv"'
        resp.write("﻿")  # BOM so Excel reads Bangla / Arabic names correctly
        w = csv.writer(resp)
        w.writerow(self.csv_columns)
        for obj in self.filter_queryset(self.get_queryset()).iterator():
            w.writerow([_csv_cell(getattr(obj, c)) for c in self.csv_columns])
        return resp


class PackageViewSet(StaffMixin, FilterMixin, viewsets.ModelViewSet):
    queryset = Package.objects.all()
    serializer_class = PackageAdminSerializer
    filter_fields = ("status", "kind")
    search_fields = ("title", "hotel_name")
    pagination_class = None


class _Inbox(StaffMixin, FilterMixin, CsvExportMixin, mixins.ListModelMixin, mixins.UpdateModelMixin,
             mixins.DestroyModelMixin, viewsets.GenericViewSet):
    http_method_names = ["get", "patch", "delete", "head", "options"]
    pagination_class = None


class EnquiryViewSet(_Inbox):
    queryset = Enquiry.objects.select_related("package")
    serializer_class = EnquiryAdminSerializer
    search_fields = ("name", "phone", "email", "message")
    csv_columns = ("id", "created_at", "name", "phone", "email", "kind", "package", "status", "message", "admin_note")


class AppointmentViewSet(_Inbox):
    queryset = Appointment.objects.all()
    serializer_class = AppointmentAdminSerializer
    search_fields = ("name", "phone", "message")
    csv_columns = ("id", "created_at", "name", "phone", "kind", "consultation_type", "preferred_at", "travellers", "status", "message", "admin_note")


class ReviewViewSet(_Inbox):
    queryset = Review.objects.all()
    serializer_class = ReviewAdminSerializer
    filter_fields = ("approved",)
    search_fields = ("name", "text")
    csv_columns = ("id", "created_at", "name", "rating", "approved", "text")


class StatsView(StaffMixin, APIView):
    def get(self, request):
        now = timezone.now()
        return Response({
            "new_enquiries": Enquiry.objects.filter(status="new").count(),
            "total_enquiries": Enquiry.objects.count(),
            "pending_appointments": Appointment.objects.filter(status__in=["new", "pending"]).count(),
            "upcoming_appointments": Appointment.objects.filter(
                preferred_at__gte=now, preferred_at__lte=now + timedelta(days=7)).exclude(status__in=["cancelled", "no_show"]).count(),
            "reviews_waiting": Review.objects.filter(approved=False).count(),
            "open_packages": Package.objects.filter(status="open").count(),
            "total_packages": Package.objects.count(),
        })
