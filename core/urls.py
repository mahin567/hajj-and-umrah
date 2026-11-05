from django.urls import include, path
from rest_framework.routers import DefaultRouter

from . import admin_api, api

router = DefaultRouter(trailing_slash=True)  # private admin-panel endpoints, staff login required
router.register("packages", admin_api.PackageViewSet, basename="manage-packages")
router.register("enquiries", admin_api.EnquiryViewSet, basename="manage-enquiries")
router.register("appointments", admin_api.AppointmentViewSet, basename="manage-appointments")
router.register("reviews", admin_api.ReviewViewSet, basename="manage-reviews")

urlpatterns = [
    path("packages/", api.PackageList.as_view()),
    path("enquiries/", api.EnquiryCreate.as_view()),
    path("appointments/", api.AppointmentCreate.as_view()),
    path("reviews/", api.ReviewListCreate.as_view()),
    path("manage/login/", admin_api.LoginView.as_view()),
    path("manage/logout/", admin_api.LogoutView.as_view()),
    path("manage/me/", admin_api.MeView.as_view()),
    path("manage/stats/", admin_api.StatsView.as_view()),
    path("manage/", include(router.urls)),
]
