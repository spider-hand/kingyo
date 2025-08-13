# Create your views here.

from rest_framework import viewsets, mixins
from rest_framework.pagination import PageNumberPagination
from .models import TestPlan, TestCase, TestResult
from .serializers import (
    TestPlanSerializer,
    TestPlanCreateSerializer,
    TestCaseSerializer,
    TestResultSerializer,
    TestResultCreateSerializer,
)

from django_filters.rest_framework import DjangoFilterBackend
from .filters import TestPlanFilter, TestCaseFilter, TestResultFilter


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


class TestCaseViewSet(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.CreateModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    viewsets.GenericViewSet,
):
    queryset = TestCase.objects.all().order_by("-created_at")
    serializer_class = TestCaseSerializer
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend]
    filterset_class = TestCaseFilter

    def get_queryset(self):
        test_plan_id = self.kwargs["test_plan_id"]
        # Optimize queries by prefetching related test results
        return (
            TestCase.objects.filter(plan_id=test_plan_id)
            .prefetch_related("test_results")
            .order_by("-created_at")
        )

    def perform_create(self, serializer):
        test_plan_id = self.kwargs["test_plan_id"]
        serializer.save(plan_id=test_plan_id)


class TestResultViewSet(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.CreateModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    viewsets.GenericViewSet,
):
    queryset = TestResult.objects.all().order_by("-executed_at")
    serializer_class = TestResultSerializer
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend]
    filterset_class = TestResultFilter

    def get_queryset(self):
        test_plan_id = self.kwargs["test_plan_id"]
        test_case_id = self.kwargs.get("test_case_id")

        if test_case_id:
            # Filter by specific test case
            return (
                TestResult.objects.filter(
                    case_id=test_case_id, case__plan_id=test_plan_id
                )
                .select_related("case", "tester")
                .order_by("-executed_at")
            )
        else:
            # Filter by test plan (all test cases in the plan)
            return (
                TestResult.objects.filter(case__plan_id=test_plan_id)
                .select_related("case", "tester")
                .order_by("-executed_at")
            )

    def get_serializer_class(self):
        if self.action == "create":
            return TestResultCreateSerializer
        return super().get_serializer_class()

    def perform_create(self, serializer):
        test_case_id = self.kwargs.get("test_case_id")
        if test_case_id:
            serializer.save(case_id=test_case_id, tester=self.request.user)
