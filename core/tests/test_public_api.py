from datetime import timedelta

from django.core import mail
from django.core.cache import cache
from django.test import override_settings
from django.utils import timezone
from rest_framework.test import APITestCase

from core.models import Appointment, Enquiry, Package, Review


class PublicApiTests(APITestCase):
    def setUp(self):
        cache.clear()  # throttle counters live in the cache
        self.open = Package.objects.create(kind="umrah", title="Open pkg", status="open", featured=True)
        Package.objects.create(kind="hajj", title="Hidden draft", status="draft")
        Package.objects.create(kind="hajj", title="Sold hajj", status="sold_out")

    # ---------- packages
    def test_packages_are_plain_array_and_hide_drafts(self):
        r = self.client.get("/api/packages/")
        self.assertEqual(r.status_code, 200)
        self.assertIsInstance(r.json(), list)
        self.assertEqual({p["title"] for p in r.json()}, {"Open pkg", "Sold hajj"})

    def test_package_filters(self):
        self.assertEqual(len(self.client.get("/api/packages/?kind=umrah").json()), 1)
        self.assertEqual(len(self.client.get("/api/packages/?status=open").json()), 1)
        self.assertEqual(len(self.client.get("/api/packages/?featured=1").json()), 1)

    def test_draft_status_filter_cannot_leak_drafts(self):
        self.assertEqual(self.client.get("/api/packages/?status=draft").json().__len__(), 2)  # ignored filter -> still no draft
        self.assertNotIn("Hidden draft", [p["title"] for p in self.client.get("/api/packages/?status=draft").json()])

    # ---------- enquiries
    def test_enquiry_created_exactly_as_frontend_sends(self):
        r = self.client.post("/api/enquiries/", {"name": "Rahim", "phone": "01712345678", "kind": "umrah", "message": ""}, format="json")
        self.assertEqual(r.status_code, 201, r.content)
        self.assertEqual(Enquiry.objects.get().status, "new")

    def test_enquiry_cleans_phone_and_name(self):
        self.client.post("/api/enquiries/", {"name": "  Rahim   Uddin ", "phone": "+880 1712-345678", "kind": "hajj"}, format="json")
        e = Enquiry.objects.get()
        self.assertEqual((e.name, e.phone), ("Rahim Uddin", "+8801712345678"))

    def test_enquiry_rejects_bad_phone_and_empty_name(self):
        r = self.client.post("/api/enquiries/", {"name": " ", "phone": "123", "kind": "umrah"}, format="json")
        self.assertEqual(r.status_code, 400)
        self.assertIn("phone", r.json())
        self.assertIn("name", r.json())

    def test_enquiry_cannot_attach_draft_package(self):
        draft = Package.objects.get(title="Hidden draft")
        r = self.client.post("/api/enquiries/", {"name": "Ab", "phone": "01712345678", "package": draft.id}, format="json")
        self.assertEqual(r.status_code, 400)

    def test_enquiry_can_attach_open_package(self):
        r = self.client.post("/api/enquiries/", {"name": "Ab", "phone": "01712345678", "package": self.open.id}, format="json")
        self.assertEqual(r.status_code, 201)

    def test_honeypot_pretends_success_but_saves_nothing(self):
        r = self.client.post("/api/enquiries/", {"name": "Bot", "phone": "01712345678", "website": "http://spam"}, format="json")
        self.assertEqual(r.status_code, 201)
        self.assertEqual(Enquiry.objects.count(), 0)

    def test_public_cannot_set_status_or_note(self):
        self.client.post("/api/enquiries/", {"name": "Ab", "phone": "01712345678", "status": "closed", "admin_note": "x"}, format="json")
        e = Enquiry.objects.get()
        self.assertEqual((e.status, e.admin_note), ("new", ""))

    def test_form_throttle(self):
        body = {"name": "Ab", "phone": "01712345678"}
        codes = [self.client.post("/api/enquiries/", body, format="json").status_code for _ in range(12)]
        self.assertEqual(codes[:10], [201] * 10)
        self.assertEqual(codes[10], 429)

    @override_settings(STAFF_NOTIFY_EMAILS=["office@example.com"])
    def test_staff_is_emailed(self):
        with self.captureOnCommitCallbacks(execute=True):
            self.client.post("/api/enquiries/", {"name": "Ab", "phone": "01712345678"}, format="json")
        self.assertEqual(len(mail.outbox), 1)
        self.assertIn("01712345678", mail.outbox[0].body)

    # ---------- appointments
    def _appt(self, **kw):
        when = (timezone.now() + timedelta(days=3)).replace(microsecond=0)
        data = {"name": "Karim", "phone": "01712345678", "kind": "umrah", "consultation_type": "Phone call",
                "preferred_at": when.isoformat(), "travellers": 2, "message": "hi"}
        data.update(kw)
        return self.client.post("/api/appointments/", data, format="json")

    def test_appointment_with_bangladesh_offset_like_frontend(self):
        day = (timezone.localdate() + timedelta(days=5)).isoformat()
        r = self._appt(preferred_at=f"{day}T10:00:00+06:00")
        self.assertEqual(r.status_code, 201, r.content)
        self.assertEqual(Appointment.objects.get().status, "new")

    def test_appointment_in_past_rejected(self):
        self.assertEqual(self._appt(preferred_at=(timezone.now() - timedelta(days=1)).isoformat()).status_code, 400)

    def test_appointment_too_far_ahead_rejected(self):
        self.assertEqual(self._appt(preferred_at=(timezone.now() + timedelta(days=400)).isoformat()).status_code, 400)

    def test_appointment_travellers_bounds(self):
        self.assertEqual(self._appt(travellers=0).status_code, 400)
        self.assertEqual(self._appt(travellers=51).status_code, 400)

    def test_duplicate_appointment_rejected(self):
        when = (timezone.now() + timedelta(days=4)).replace(microsecond=0).isoformat()
        self.assertEqual(self._appt(preferred_at=when).status_code, 201)
        self.assertEqual(self._appt(preferred_at=when).status_code, 400)

    # ---------- reviews
    def test_review_goes_to_moderation_and_is_not_public(self):
        r = self.client.post("/api/reviews/", {"name": "Hasan", "rating": 5, "text": "Wonderful, well organised trip."}, format="json")
        self.assertEqual(r.status_code, 201)
        self.assertFalse(Review.objects.get().approved)
        self.assertEqual(self.client.get("/api/reviews/").json(), [])

    def test_public_cannot_self_approve_review(self):
        self.client.post("/api/reviews/", {"name": "Hasan", "rating": 5, "text": "Wonderful trip, thank you.", "approved": True}, format="json")
        self.assertFalse(Review.objects.get().approved)

    def test_approved_review_is_listed_and_rating_validated(self):
        Review.objects.create(name="A", rating=4, text="Good service overall.", approved=True)
        self.assertEqual(len(self.client.get("/api/reviews/").json()), 1)
        r = self.client.post("/api/reviews/", {"name": "B", "rating": 9, "text": "Long enough text here."}, format="json")
        self.assertEqual(r.status_code, 400)

    def test_health_and_json_only(self):
        self.assertEqual(self.client.get("/healthz").json(), {"status": "ok"})
        r = self.client.post("/api/enquiries/", "name=x", content_type="application/x-www-form-urlencoded")
        self.assertEqual(r.status_code, 415)
