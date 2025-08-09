from django.urls.conf import include
from django.contrib import admin
from django.urls import path
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

from testplan.urls import urlpatterns as testplan_urls

api_v1_patterns = [
    path("", include(testplan_urls)),
]

urlpatterns = [
    path("admin/", admin.site.urls),
    path("schema/", SpectacularAPIView.as_view(), name="schema"),
    path("schema/swagger-ui/", SpectacularSwaggerView.as_view(), name="swagger-ui"),
    path("api/v1/", include(api_v1_patterns)),
]
