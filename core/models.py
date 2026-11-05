from django.core.validators import MaxValueValidator, MinValueValidator, RegexValidator
from django.db import models

phone_validator = RegexValidator(r"^\+?\d{10,15}$", "Enter 10 to 15 digits, optionally starting with +.")


class Package(models.Model):
    KIND = [("umrah", "Umrah"), ("hajj", "Hajj")]
    STATUS = [("draft", "Draft"), ("open", "Open"), ("sold_out", "Sold out"), ("completed", "Completed")]
    METHOD = [("walking", "Walking route"), ("straight", "Straight line"), ("unverified", "Approximate, route not verified")]
    kind = models.CharField(max_length=10, choices=KIND)
    title = models.CharField(max_length=160)
    departure_date = models.DateField(null=True, blank=True)
    duration_days = models.PositiveIntegerField(null=True, blank=True, validators=[MinValueValidator(1), MaxValueValidator(120)])
    hotel_name = models.CharField(max_length=160, blank=True)
    distance_m = models.PositiveIntegerField(null=True, blank=True)
    distance_method = models.CharField(max_length=12, choices=METHOD, default="unverified")
    price_bdt = models.DecimalField(max_digits=12, decimal_places=0, null=True, blank=True, validators=[MinValueValidator(0)])
    seats_remaining = models.PositiveIntegerField(null=True, blank=True, help_text="Only fill if tracked accurately")
    offer_deadline = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=10, choices=STATUS, default="draft")
    featured = models.BooleanField(default=False)
    last_verified = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, null=True)
    updated_at = models.DateTimeField(auto_now=True, null=True)

    class Meta:
        ordering = ["departure_date", "id"]
        indexes = [models.Index(fields=["kind", "status"])]

    def __str__(self):
        return self.title


class Enquiry(models.Model):
    STATUS = [("new", "New"), ("contacted", "Contacted"), ("quoted", "Quoted"), ("closed", "Closed")]
    name = models.CharField(max_length=120)
    phone = models.CharField(max_length=30, validators=[phone_validator])
    email = models.EmailField(blank=True)
    kind = models.CharField(max_length=10, choices=Package.KIND, default="umrah")
    package = models.ForeignKey(Package, null=True, blank=True, on_delete=models.SET_NULL)
    message = models.TextField(blank=True, max_length=2000)
    status = models.CharField(max_length=10, choices=STATUS, default="new")
    admin_note = models.TextField(blank=True, help_text="Private note for staff. Never shown on the website.")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True, null=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name_plural = "enquiries"
        indexes = [models.Index(fields=["status", "-created_at"])]

    def __str__(self):
        return f"{self.name} ({self.phone})"


class Appointment(models.Model):
    STATUS = [("new", "New"), ("pending", "Pending confirmation"), ("confirmed", "Confirmed"),
              ("completed", "Completed"), ("cancelled", "Cancelled"), ("no_show", "No-show")]
    name = models.CharField(max_length=120)
    phone = models.CharField(max_length=30, validators=[phone_validator])
    kind = models.CharField(max_length=10, choices=Package.KIND, default="umrah")
    consultation_type = models.CharField(max_length=60, blank=True)
    preferred_at = models.DateTimeField()
    travellers = models.PositiveIntegerField(default=1, validators=[MinValueValidator(1), MaxValueValidator(50)])
    message = models.TextField(blank=True, max_length=2000)
    status = models.CharField(max_length=10, choices=STATUS, default="new")
    admin_note = models.TextField(blank=True, help_text="Private note for staff. Never shown on the website.")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True, null=True)

    class Meta:
        ordering = ["preferred_at"]
        indexes = [models.Index(fields=["status", "preferred_at"])]

    def __str__(self):
        return f"{self.name} @ {self.preferred_at:%Y-%m-%d %H:%M}"


class Review(models.Model):
    name = models.CharField(max_length=80)
    rating = models.PositiveSmallIntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    text = models.TextField(max_length=1500)
    approved = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [models.Index(fields=["approved", "-created_at"])]

    def __str__(self):
        return f"{self.name}: {self.rating}/5"
