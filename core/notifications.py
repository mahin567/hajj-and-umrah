"""Staff email alerts. Sending never blocks or breaks a visitor's request: failures are only logged."""
import logging

from django.conf import settings
from django.core.mail import send_mail
from django.db import transaction

log = logging.getLogger(__name__)


def notify_staff(subject, body):
    recipients = settings.STAFF_NOTIFY_EMAILS
    if not recipients:
        return

    def _send():
        try:
            send_mail(f"[Own The World] {subject}", body, settings.DEFAULT_FROM_EMAIL, recipients, fail_silently=False)
        except Exception:  # noqa: BLE001 - an SMTP outage must never lose the enquiry
            log.exception("Could not send staff notification: %s", subject)

    transaction.on_commit(_send)


def new_enquiry(e):
    notify_staff(
        f"New {e.kind} enquiry from {e.name}",
        f"Name: {e.name}\nPhone: {e.phone}\nEmail: {e.email or '-'}\nInterested in: {e.kind}\n"
        f"Package: {e.package or '-'}\n\nMessage:\n{e.message or '-'}\n",
    )


def new_appointment(a):
    notify_staff(
        f"New appointment request from {a.name}",
        f"Name: {a.name}\nPhone: {a.phone}\nInterested in: {a.kind}\nType: {a.consultation_type or '-'}\n"
        f"Preferred time: {a.preferred_at:%a %d %b %Y, %H:%M} (Bangladesh time)\nTravellers: {a.travellers}\n\n"
        f"Message:\n{a.message or '-'}\n\nNot confirmed until staff contact the customer.\n",
    )


def new_review(r):
    notify_staff(f"New review waiting for approval ({r.rating}/5)", f"{r.name} wrote:\n\n{r.text}\n\nApprove it in the admin panel.")
