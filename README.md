# Backend (Django + Django REST Framework)

## Run locally
```bash
cd backend
python -m venv venv && source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env                                  # already has DJANGO_DEBUG=1 for local use
python manage.py migrate
python manage.py createsuperuser                      # your office login (Django /admin/ and the React admin panel)
python manage.py seed_demo                            # optional: [DEMO] packages to try the site; remove with --clear
python manage.py runserver                            # http://127.0.0.1:8000
python manage.py test                                 # 36 tests
```

## Public API (no login)
| Method | URL | Notes |
|---|---|---|
| GET | `/api/packages/?kind=umrah\|hajj&status=open&featured=1` | Plain array. Drafts are never returned. |
| POST | `/api/enquiries/` | `name, phone, kind, message, email?, package?` |
| POST | `/api/appointments/` | `name, phone, kind, consultation_type, preferred_at (ISO, e.g. 2026-12-01T10:00:00+06:00), travellers 1-50, message` |
| GET / POST | `/api/reviews/` | GET = approved only. POST is saved unapproved until staff approve it. |
| GET | `/healthz` | Liveness check for the host. |

Safeguards: 10 submissions/hour per IP, hidden `website` honeypot field, phone normalised to digits, appointment must be 30 min to 120 days ahead, duplicate appointment slot refused, clients cannot set `status`, `approved` or notes, JSON only. Errors come back as `{"field": ["message"]}` with HTTP 400.

## Staff API (`Authorization: Token <key>`)
`POST /api/manage/login/` returns a token (a new login invalidates the old one; expires after 12 h). Then:
`GET /api/manage/me/`, `GET /api/manage/stats/`, `POST /api/manage/logout/`
`/api/manage/packages/` full CRUD. `/api/manage/enquiries/`, `/appointments/`, `/reviews/` list, PATCH (status, `admin_note`, `approved`) and DELETE.
List filters: `?status=` `?kind=` `?search=` (and `?approved=0|1` for reviews).
CSV for Excel: `GET /api/manage/enquiries/export/` (also appointments, reviews). Needs the token header, so download it with `fetch` + blob, not a plain link. Cells that start with `= + - @` are escaped.

## Email alerts
Set `STAFF_NOTIFY_EMAILS` and the `EMAIL_*` variables. Each new enquiry, appointment and review emails your team. If email is down the visitor's submission is still saved.

## Deploy (Render, Railway, Fly, a VPS, anything that runs Python or Docker)
1. Provision PostgreSQL and set `DATABASE_URL`.
2. Set `DJANGO_SECRET_KEY`, `DJANGO_ALLOWED_HOSTS`, `CORS_ALLOWED_ORIGINS` (your Vercel URL), `CSRF_TRUSTED_ORIGINS` (this API's https URL), plus the email variables. The app refuses to start in production without a secret key and allowed hosts.
3. Start command: see `Procfile` (migrate + collectstatic, then gunicorn), or build the `Dockerfile`.
4. Run `python manage.py createsuperuser` once.
5. Frontend: set `VITE_API_URL=https://<api-domain>/api` and add `https://<api-domain>` to `connect-src` in `frontend/vercel.json` and `frontend/public/_headers`.
6. Back up the database regularly. Enquiries contain customers' phone numbers, so keep staff accounts few and use strong passwords. `ADMIN_URL` lets you move the Django admin to a less guessable address.
