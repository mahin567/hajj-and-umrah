"""Load clearly-labelled DEMO data so you can try the site and admin panel locally.

    python manage.py seed_demo          # add demo rows
    python manage.py seed_demo --clear  # remove them again

Demo rows start with "[DEMO]". Prices and dates are made up. Never run this on the live site.
"""
from datetime import timedelta

from django.core.management.base import BaseCommand, CommandError
from django.conf import settings
from django.utils import timezone

from core.models import Package, Review

TAG = "[DEMO] "


class Command(BaseCommand):
    help = "Create or remove demo packages and reviews (development only)."

    def add_arguments(self, parser):
        parser.add_argument("--clear", action="store_true", help="delete the demo rows")

    def handle(self, *args, **opts):
        if opts["clear"]:
            p = Package.objects.filter(title__startswith=TAG).delete()[0]
            r = Review.objects.filter(name__startswith=TAG).delete()[0]
            self.stdout.write(f"Removed {p + r} demo rows.")
            return
        if not settings.DEBUG:
            raise CommandError("seed_demo only runs with DJANGO_DEBUG=1 so fake data cannot reach the live site.")
        today = timezone.localdate()
        rows = [
            ("umrah", "Economy Umrah, 10 days", 30, 10, "Demo Hotel Makkah", 650, 118000, "open", True),
            ("umrah", "Premium Umrah, 14 days", 55, 14, "Demo Hotel Haram View", 180, 245000, "open", False),
            ("umrah", "Ramadan Umrah, 15 days", 120, 15, "Demo Hotel Clock", 300, 390000, "draft", False),
            ("hajj", "Hajj 2027 Standard", 240, 40, "Demo Aziziyah Building", 1500, 780000, "open", True),
        ]
        for kind, title, days, dur, hotel, dist, price, st, feat in rows:
            Package.objects.get_or_create(
                title=TAG + title,
                defaults=dict(kind=kind, departure_date=today + timedelta(days=days), duration_days=dur, hotel_name=hotel,
                              distance_m=dist, price_bdt=price, status=st, featured=feat,
                              offer_deadline=timezone.now() + timedelta(days=max(days - 10, 3))),
            )
        Review.objects.get_or_create(name=TAG + "Sample", defaults=dict(rating=5, text="Demo review text for local testing only.", approved=True))
        self.stdout.write(self.style.SUCCESS("Demo data added. Remove with: python manage.py seed_demo --clear"))
