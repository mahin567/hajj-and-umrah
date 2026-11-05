"""Public API used by the website (/api/...). No login needed; abuse is limited by throttling and validation."""
import re
from datetime import timedelta

from django.conf import settings
from django.http import JsonResponse
from django.utils import timezone
from rest_framework import generics, serializers, status
from rest_framework.response import Response
from rest_framework.throttling import AnonRateThrottle
from rest_framework.views import exception_handler as drf_exception_handler

from . import notifications
from .models import Appointment, Enquiry, Package, Review

PHONE_RE = re.compile(r"^\+?\d{10,15}$")


def exception_handler(exc, context):
    """Always answer with JSON, and never leak a stack trace."""
    return drf_exception_handler(exc, context)


def healthz(request):
    """Used by the hosting platform to check the app is alive."""
    return JsonResponse({"status": "ok"})


# ------------------------------------------------------------------ throttles
class FormThrottle(AnonRateThrottle):
    scope = "public_form"  # spam protection for everything visitors can submit


class ReadThrottle(AnonRateThrottle):
    scope = "public_read"


# ------------------------------------------------------------------ serializers
def clean_phone(value):
    value = re.sub(r"[\s\-()]", "", value or "")
    if not PHONE_RE.match(value):
        raise serializers.ValidationError("Enter a phone number with 10 to 15 digits, for example 01712345678.")
    return value


class CleanTextMixin:
    """Trim whitespace and reject names/messages that are empty after trimming."""

    def validate_name(self, value):
        value = " ".join(value.split())
        if len(value) < 2:
            raise serializers.ValidationError("Please enter your name.")
        return value

    def validate_phone(self, value):
        return clean_phone(value)


class PhoneField(serializers.CharField):
    """Accepts '01712 345678' / '+880-1712-345678' and stores digits only (cleaned before validation)."""

    def __init__(self, **kw):
        super().__init__(max_length=30, **kw)


class PackageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Package
        fields = [
            "id", "kind", "title", "departure_date", "duration_days", "hotel_name", "distance_m",
            "distance_method", "price_bdt", "seats_remaining", "offer_deadline", "status", "featured", "last_verified",
        ]


class EnquirySerializer(CleanTextMixin, serializers.ModelSerializer):
    phone = PhoneField()
    package = serializers.PrimaryKeyRelatedField(
        queryset=Package.objects.exclude(status="draft"), required=False, allow_null=True
    )
    website = serializers.CharField(write_only=True, required=False, allow_blank=True)  # honeypot, see create()

    class Meta:
        model = Enquiry
        fields = ["name", "phone", "email", "kind", "package", "message", "website"]

    def create(self, validated_data):
        validated_data.pop("website", None)
        return super().create(validated_data)


class AppointmentSerializer(CleanTextMixin, serializers.ModelSerializer):
    phone = PhoneField()
    website = serializers.CharField(write_only=True, required=False, allow_blank=True)  # honeypot

    class Meta:
        model = Appointment
        fields = ["name", "phone", "kind", "consultation_type", "preferred_at", "travellers", "message", "website"]

    def validate_preferred_at(self, value):
        now = timezone.now()
        if value < now + timedelta(minutes=settings.BOOKING_MIN_NOTICE_MINUTES):
            raise serializers.ValidationError("Please choose a time in the future.")
        if value > now + timedelta(days=settings.BOOKING_MAX_DAYS_AHEAD):
            raise serializers.ValidationError(f"Appointments can be booked up to {settings.BOOKING_MAX_DAYS_AHEAD} days ahead.")
        return value

    def validate(self, attrs):
        dup = Appointment.objects.filter(phone=attrs["phone"], preferred_at=attrs["preferred_at"]).exclude(
            status__in=["cancelled", "no_show"]
        )
        if dup.exists():
            raise serializers.ValidationError({"preferred_at": "You already requested this time. We will contact you to confirm."})
        return attrs

    def create(self, validated_data):
        validated_data.pop("website", None)
        return super().create(validated_data)


class ReviewSerializer(CleanTextMixin, serializers.ModelSerializer):
    website = serializers.CharField(write_only=True, required=False, allow_blank=True)  # honeypot

    class Meta:
        model = Review
        fields = ["id", "name", "rating", "text", "created_at", "website"]
        read_only_fields = ["id", "created_at"]

    def validate_text(self, value):
        value = value.strip()
        if len(value) < 10:
            raise serializers.ValidationError("Please write at least a short sentence.")
        return value

    def create(self, validated_data):
        validated_data.pop("website", None)
        return super().create(validated_data)


# ------------------------------------------------------------------ views
class HoneypotCreateMixin:
    """Bots fill every field, including the hidden `website` one. Pretend it worked and save nothing."""

    on_created = None

    def create(self, request, *args, **kwargs):
        if str(request.data.get("website", "")).strip():
            return Response({}, status=status.HTTP_201_CREATED)
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        obj = serializer.save()
        if self.on_created:
            self.on_created(obj)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class PackageList(generics.ListAPIView):
    """GET /api/packages/?kind=umrah|hajj&status=open&featured=1  ->  plain JSON array. Drafts are never public."""

    serializer_class = PackageSerializer
    throttle_classes = [ReadThrottle]
    pagination_class = None

    def get_queryset(self):
        qs = Package.objects.exclude(status="draft")
        q = self.request.query_params
        kind, st = q.get("kind"), q.get("status")
        if kind in dict(Package.KIND):
            qs = qs.filter(kind=kind)
        if st in dict(Package.STATUS) and st != "draft":
            qs = qs.filter(status=st)
        if q.get("featured", "").lower() in {"1", "true", "yes"}:
            qs = qs.filter(featured=True)
        return qs


class EnquiryCreate(HoneypotCreateMixin, generics.CreateAPIView):
    serializer_class = EnquirySerializer
    throttle_classes = [FormThrottle]
    on_created = staticmethod(notifications.new_enquiry)


class AppointmentCreate(HoneypotCreateMixin, generics.CreateAPIView):
    serializer_class = AppointmentSerializer
    throttle_classes = [FormThrottle]
    on_created = staticmethod(notifications.new_appointment)


class ReviewListCreate(HoneypotCreateMixin, generics.ListCreateAPIView):
    """GET lists approved reviews only. POST saves a new review as unapproved (moderation queue)."""

    serializer_class = ReviewSerializer
    pagination_class = None
    on_created = staticmethod(notifications.new_review)

    def get_queryset(self):
        return Review.objects.filter(approved=True)

    def get_throttles(self):
        return [FormThrottle()] if self.request.method == "POST" else [ReadThrottle()]
