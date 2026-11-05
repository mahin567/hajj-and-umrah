from django.conf import settings
from django.contrib import admin
from django.urls import include, path

from core.api import healthz

admin.site.site_header = "Own The World: Hajj & Umrah"
admin.site.site_title = "Own The World admin"
admin.site.index_title = "Office panel"

urlpatterns = [
    path("healthz", healthz),
    path(settings.ADMIN_URL, admin.site.urls),
    path("api/", include("core.urls")),
]
