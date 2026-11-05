from django.contrib import admin

from .models import Appointment, Enquiry, Package, Review


@admin.register(Package)
class PackageAdmin(admin.ModelAdmin):
    list_display = ("title", "kind", "departure_date", "price_bdt", "status", "featured", "last_verified")
    list_filter = ("kind", "status", "featured")
    list_editable = ("status", "featured")
    search_fields = ("title", "hotel_name")
    date_hierarchy = "departure_date"


@admin.register(Enquiry)
class EnquiryAdmin(admin.ModelAdmin):
    list_display = ("name", "phone", "kind", "package", "status", "created_at")
    list_filter = ("kind", "status")
    search_fields = ("name", "phone", "email", "message")
    readonly_fields = ("created_at", "updated_at")
    date_hierarchy = "created_at"


@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    list_display = ("name", "phone", "kind", "consultation_type", "preferred_at", "travellers", "status")
    list_filter = ("kind", "status", "consultation_type")
    search_fields = ("name", "phone", "message")
    readonly_fields = ("created_at", "updated_at")
    date_hierarchy = "preferred_at"


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ("name", "rating", "approved", "created_at")
    list_filter = ("approved", "rating")
    search_fields = ("name", "text")
    actions = ["approve", "unapprove"]

    @admin.action(description="Approve selected reviews")
    def approve(self, request, queryset):
        queryset.update(approved=True)

    @admin.action(description="Hide selected reviews")
    def unapprove(self, request, queryset):
        queryset.update(approved=False)
