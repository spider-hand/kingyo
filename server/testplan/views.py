# Create your views here.

from rest_framework import viewsets, mixins, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from django.contrib.auth.models import User
from django.db import transaction
from .models import TestPlan, TestCase, TestResult, TestStep, TestResultStep
from .serializers import (
    TestPlanSerializer,
    TestPlanCreateSerializer,
    TestCaseSerializer,
    TestResultSerializer,
    TestResultCreateSerializer,
    UserSerializer,
    TestStepSerializer,
    TestStepCreateSerializer,
    TestResultStepSerializer,
    TestResultStepCreateSerializer,
)

from django_filters.rest_framework import DjangoFilterBackend
from .filters import TestPlanFilter, TestCaseFilter, TestResultFilter
from drf_spectacular.utils import extend_schema


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


class UserViewSet(
    mixins.ListModelMixin,
    viewsets.GenericViewSet,
):
    queryset = User.objects.filter(is_active=True).order_by("username")
    serializer_class = UserSerializer
    pagination_class = None  # Disable pagination

    @action(detail=False, methods=["get"])
    def me(self, request):
        """Get the current authenticated user"""
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)


class TestStepViewSet(
    mixins.ListModelMixin,
    mixins.CreateModelMixin,
    viewsets.GenericViewSet,
):
    queryset = TestStep.objects.all().order_by("order")
    serializer_class = TestStepSerializer
    pagination_class = None  # Disable pagination

    def get_queryset(self):
        test_case_id = self.kwargs["test_case_id"]

        return TestStep.objects.filter(case_id=test_case_id).order_by("order")

    def get_serializer_class(self):
        if self.action == "create":
            return TestStepCreateSerializer
        return super().get_serializer_class()

    # Manually define the schema because drf-spectacular cannot handle nested serializers in this context
    @extend_schema(
        request={
            "application/json": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "order": {"type": "integer", "minimum": 0, "format": "int64"},
                        "action": {"type": "string"},
                        "expected_result": {"type": "string"},
                    },
                    "required": ["order"],
                },
            }
        },
        responses={
            201: {
                "type": "array",
                "items": {"$ref": "#/components/schemas/TestStep"},
            }
        },
        description="Create multiple test steps at once. Replaces all existing test steps for the given test case. Expects an array of test step objects in the request data.",
    )
    def create(self, request, *args, **kwargs):
        """
        Create multiple test steps at once.
        Replaces all existing test steps for the given test case.
        Expects an array of test step objects in the request data.
        """
        test_case_id = self.kwargs["test_case_id"]

        # Replace all steps in a single transaction
        with transaction.atomic():
            # Delete all existing test steps for this test case
            TestStep.objects.filter(case_id=test_case_id).delete()

            # Create all new steps
            created_steps = []
            for step_data in request.data:
                serializer = self.get_serializer(data=step_data)
                if not serializer.is_valid():
                    return Response(
                        serializer.errors, status=status.HTTP_400_BAD_REQUEST
                    )
                step = serializer.save(case_id=test_case_id)
                created_steps.append(step)

        # Return the created ones
        response_serializer = TestStepSerializer(created_steps, many=True)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)


class TestResultStepViewSet(
    mixins.ListModelMixin,
    mixins.CreateModelMixin,
    viewsets.GenericViewSet,
):
    queryset = TestResultStep.objects.all().order_by("order")
    serializer_class = TestResultStepSerializer
    pagination_class = None  # Disable pagination

    def get_queryset(self):
        test_result_id = self.kwargs["test_result_id"]

        return TestResultStep.objects.filter(result_id=test_result_id).order_by("order")

    def get_serializer_class(self):
        if self.action == "create":
            return TestResultStepCreateSerializer
        return super().get_serializer_class()

    # Manually define the schema because drf-spectacular cannot handle nested serializers in this context
    @extend_schema(
        request={
            "application/json": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "step": {"type": "integer", "nullable": True},
                        "order": {"type": "integer", "minimum": 0, "format": "int64"},
                        "action": {"type": "string"},
                        "expected_result": {"type": "string"},
                        "status": {"type": "string", "enum": ["pass", "fail", "skip"]},
                        "comment": {"type": "string"},
                    },
                    "required": ["order"],
                },
            }
        },
        responses={
            201: {
                "type": "array",
                "items": {"$ref": "#/components/schemas/TestResultStep"},
            }
        },
        description="Create multiple test result steps at once. Replaces all existing test result steps for the given test result. Expects an array of test result step objects in the request data.",
    )
    def create(self, request, *args, **kwargs):
        """
        Create multiple test result steps at once.
        Replaces all existing test result steps for the given test result.
        Expects an array of test result step objects in the request data.
        """
        test_result_id = self.kwargs["test_result_id"]

        # Replace all steps in a single transaction
        with transaction.atomic():
            # Delete all existing test result steps for this test result
            TestResultStep.objects.filter(result_id=test_result_id).delete()

            # Create all new steps
            created_steps = []
            for step_data in request.data:
                serializer = self.get_serializer(data=step_data)
                if not serializer.is_valid():
                    return Response(
                        serializer.errors, status=status.HTTP_400_BAD_REQUEST
                    )
                step = serializer.save(result_id=test_result_id)
                created_steps.append(step)

        # Return the created ones
        response_serializer = TestResultStepSerializer(created_steps, many=True)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)
