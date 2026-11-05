from datetime import timedelta

from django.contrib.auth import get_user_model
from django.core.cache import cache
from django.utils import timezone
from rest_framework.authtoken.models import Token
from rest_framework.test import APITestCase

from core.models import Appointment, Enquiry, Package, Review

User = get_user_model()


class AdminApiTests(APITestCase):
    def setUp(self):
        cache.clear()
        self.staff = User.objects.create_user("boss", password="correct-horse-99", is_staff=True)
        self.visitor = User.objects.create_user("guest", password="correct-horse-99", is_staff=False)
        self.enq = Enquiry.objects.create(name="Rahim", phone="01712345678")
        self.review = Review.objects.create(name="A", rating=5, text="Great trip indeed.")

    def login(self, user="boss", pw="correct-horse-99"):
        return self.client.post("/api/manage/login/", {"username": user, "password": pw}, format="json")

    def auth(self):
        token = self.login().json()["token"]
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {token}")

    # ---------- auth
    def test_endpoints_require_login(self):
        for path in ["packages", "enquiries", "appointments", "reviews", "stats", "me"]:
            self.assertEqual(self.client.get(f"/api/manage/{path}/").status_code, 401, path)

    def test_login_ok_wrong_password_and_non_staff(self):
        self.assertEqual(self.login().status_code, 200)
        self.assertEqual(self.login(pw="nope").status_code, 400)
        self.assertEqual(self.login("guest").status_code, 400)

    def test_non_staff_token_is_refused(self):
        t = Token.objects.create(user=self.visitor)
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {t.key}")
        self.assertEqual(self.client.get("/api/manage/enquiries/").status_code, 403)

    def test_new_login_invalidates_old_token_and_logout_works(self):
        old = self.login().json()["token"]
        new = self.login().json()["token"]
        self.assertNotEqual(old, new)
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {old}")
        self.assertEqual(self.client.get("/api/manage/me/").status_code, 401)
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {new}")
        self.assertEqual(self.client.post("/api/manage/logout/").status_code, 204)
        self.assertEqual(self.client.get("/api/manage/me/").status_code, 401)

    def test_expired_token_rejected(self):
        self.auth()
        Token.objects.update(created=timezone.now() - timedelta(hours=13))
        self.assertEqual(self.client.get("/api/manage/me/").status_code, 401)

    def test_login_throttled(self):
        codes = [self.login(pw="bad").status_code for _ in range(12)]
        self.assertIn(429, codes)

    # ---------- packages CRUD (as the admin panel does it)
    def test_package_crud(self):
        self.auth()
        r = self.client.post("/api/manage/packages/", {"kind": "umrah", "title": "New", "status": "draft"}, format="json")
        self.assertEqual(r.status_code, 201, r.content)
        pid = r.json()["id"]
        self.assertEqual(self.client.patch(f"/api/manage/packages/{pid}/", {"status": "open"}, format="json").status_code, 200)
        self.assertEqual(len(self.client.get("/api/packages/").json()), 1)  # now public
        self.assertEqual(self.client.delete(f"/api/manage/packages/{pid}/").status_code, 204)

    def test_package_filter_and_search(self):
        Package.objects.create(kind="hajj", title="Hajj A", status="open")
        Package.objects.create(kind="umrah", title="Umrah B", status="draft", hotel_name="Zamzam")
        self.auth()
        self.assertEqual(len(self.client.get("/api/manage/packages/?kind=hajj").json()), 1)
        self.assertEqual(len(self.client.get("/api/manage/packages/?search=zamzam").json()), 1)

    # ---------- inboxes
    def test_enquiry_staff_can_only_change_status_and_note(self):
        self.auth()
        r = self.client.patch(f"/api/manage/enquiries/{self.enq.id}/", {"status": "contacted", "admin_note": "called", "name": "HACK"}, format="json")
        self.assertEqual(r.status_code, 200)
        self.enq.refresh_from_db()
        self.assertEqual((self.enq.status, self.enq.admin_note, self.enq.name), ("contacted", "called", "Rahim"))

    def test_enquiry_cannot_be_created_or_put_by_staff(self):
        self.auth()
        self.assertEqual(self.client.post("/api/manage/enquiries/", {}, format="json").status_code, 405)

    def test_enquiry_search_and_filter(self):
        Enquiry.objects.create(name="Other", phone="01811111111", status="closed")
        self.auth()
        self.assertEqual(len(self.client.get("/api/manage/enquiries/?status=new").json()), 1)
        self.assertEqual(len(self.client.get("/api/manage/enquiries/?search=0181").json()), 1)

    def test_appointment_status_update_and_delete(self):
        a = Appointment.objects.create(name="K", phone="01712345678", preferred_at=timezone.now() + timedelta(days=1))
        self.auth()
        self.assertEqual(self.client.patch(f"/api/manage/appointments/{a.id}/", {"status": "confirmed"}, format="json").status_code, 200)
        self.assertEqual(self.client.delete(f"/api/manage/appointments/{a.id}/").status_code, 204)

    def test_review_approve_and_filter(self):
        self.auth()
        self.assertEqual(self.client.patch(f"/api/manage/reviews/{self.review.id}/", {"approved": True}, format="json").status_code, 200)
        self.assertEqual(len(self.client.get("/api/reviews/").json()), 1)
        self.assertEqual(len(self.client.get("/api/manage/reviews/?approved=0").json()), 0)

    def test_stats(self):
        self.auth()
        s = self.client.get("/api/manage/stats/").json()
        self.assertEqual((s["new_enquiries"], s["reviews_waiting"], s["total_packages"]), (1, 1, 0))

    # ---------- CSV export
    def test_csv_export_is_protected_and_escapes_formulas(self):
        self.assertEqual(self.client.get("/api/manage/enquiries/export/").status_code, 401)
        Enquiry.objects.create(name="=HYPERLINK(\"http://evil\")", phone="01712345678")
        self.auth()
        r = self.client.get("/api/manage/enquiries/export/")
        self.assertEqual(r.status_code, 200)
        self.assertIn("text/csv", r["Content-Type"])
        body = r.content.decode("utf-8-sig")
        self.assertIn("'=HYPERLINK", body)
        self.assertNotIn(",=HYPERLINK", body)
