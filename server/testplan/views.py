# Create your views here.

from rest_framework import viewsets, mixins
from rest_framework.pagination import PageNumberPagination
from .models import TestPlan
from .serializers import TestPlanSerializer, TestPlanCreateSerializer

from django_filters.rest_framework import DjangoFilterBackend
from .filters import TestPlanFilter


class StandardResultsSetPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = "page_size"
    max_page_size = 100


class TestPlanViewSet(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.CreateModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    viewsets.GenericViewSet,
):
    queryset = TestPlan.objects.all().order_by("-created_at")
    serializer_class = TestPlanSerializer
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend]
    filterset_class = TestPlanFilter

    def get_serializer_class(self):
        if self.action == "create":
            return TestPlanCreateSerializer
        return super().get_serializer_class()
