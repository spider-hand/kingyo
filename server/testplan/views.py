# Create your views here.

from rest_framework import viewsets
from rest_framework.pagination import PageNumberPagination
from .models import TestPlan
from .serializers import TestPlanSerializer

from django_filters.rest_framework import DjangoFilterBackend
from .filters import TestPlanFilter


class StandardResultsSetPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = "page_size"
    max_page_size = 100


class TestPlanViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = TestPlan.objects.all().order_by("-created_at")
    serializer_class = TestPlanSerializer
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend]
    filterset_class = TestPlanFilter
