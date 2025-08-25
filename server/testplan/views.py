# Create your views here.

from rest_framework import viewsets, mixins, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from django.contrib.auth.models import User
from django.db import transaction
from django.http import FileResponse, Http404
from .models import (
    TestPlan,
    TestCase,
    TestResult,
    TestStep,
    TestResultStep,
    TestStepAttachment,
    TestResultStepAttachment,
)
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
    TestStepAttachmentSerializer,
    TestStepAttachmentCreateSerializer,
    TestResultStepAttachmentSerializer,
    TestResultStepAttachmentCreateSerializer,
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


class TestStepAttachmentViewSet(
    mixins.ListModelMixin,
    mixins.CreateModelMixin,
    viewsets.GenericViewSet,
):
    queryset = TestStepAttachment.objects.all()
    serializer_class = TestStepAttachmentSerializer
    pagination_class = None  # Disable pagination

    def get_queryset(self):
        test_case_id = self.kwargs["test_case_id"]
        # Get all attachments for steps that belong to the given test case
        return TestStepAttachment.objects.filter(
            step__case_id=test_case_id
        ).select_related("step")

    def get_serializer_class(self):
        if self.action == "create":
            return TestStepAttachmentCreateSerializer
        return super().get_serializer_class()

    # This schema cannot be used in client because OpenAPI doesn't support array of files in multipart/form-data
    @extend_schema(
        request={
            "multipart/form-data": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "step": {
                            "type": "integer",
                            "description": "ID of the test step",
                        },
                        "file": {
                            "type": "string",
                            "format": "binary",
                            "description": "File to attach",
                        },
                    },
                    "required": ["step", "file"],
                },
            }
        },
        responses={
            201: {
                "type": "array",
                "items": {"$ref": "#/components/schemas/TestStepAttachment"},
            }
        },
        description="Create multiple test step attachments at once. Replaces all existing attachments for the given test case. Expects an array of test step attachment objects in the request data.",
    )
    def create(self, request, *args, **kwargs):
        """
        Create multiple test step attachments at once.
        Replaces all existing attachments for the given test case.
        """
        test_case_id = self.kwargs["test_case_id"]

        # Parse multipart form data
        attachments_data = []
        index = 0
        while True:
            step_key = f"{index}_step"
            file_key = f"{index}_file"

            if step_key not in request.data or file_key not in request.data:
                break

            attachments_data.append(
                {"step": int(request.data[step_key]), "file": request.data[file_key]}
            )
            index += 1

        if not attachments_data:
            return Response(
                {"error": "No attachment data provided"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Replace all attachments in a single transaction
        with transaction.atomic():
            # Delete all existing test step attachments for this test case
            TestStepAttachment.objects.filter(step__case_id=test_case_id).delete()

            # Create all new attachments
            created_attachments = []
            for attachment_data in attachments_data:
                # Check if TestStep associated with the test case and the order exists
                step_order = attachment_data.get("step")
                if step_order is not None:
                    try:
                        step = TestStep.objects.get(
                            order=step_order, case_id=test_case_id
                        )
                        attachment_data["step"] = step.pk
                    except TestStep.DoesNotExist:
                        return Response(
                            {
                                "error": f"Test step {step_order} not found or does not belong to test case {test_case_id}"
                            },
                            status=status.HTTP_400_BAD_REQUEST,
                        )

                serializer = self.get_serializer(data=attachment_data)
                if not serializer.is_valid():
                    return Response(
                        serializer.errors, status=status.HTTP_400_BAD_REQUEST
                    )
                attachment = serializer.save()
                created_attachments.append(attachment)

        # Return the created ones
        response_serializer = TestStepAttachmentSerializer(
            created_attachments, many=True
        )
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)

    @extend_schema(
        responses={
            200: {
                "type": "string",
                "format": "binary",
                "description": "The file content",
            },
            404: {"type": "object", "properties": {"detail": {"type": "string"}}},
        },
        description="Download the attachment file through Django proxy",
    )
    @action(detail=True, methods=["get"])
    def download(self, request, *args, **kwargs):
        """Download the attachment file through Django proxy"""
        attachment = self.get_object()

        if not attachment.file:
            raise Http404("File not found")

        try:
            # Get file name for the response
            file_name = (
                attachment.file.name.split("/")[-1]
                if attachment.file.name
                else "attachment"
            )

            # Stream the file through Django
            response = FileResponse(
                attachment.file.open("rb"),
                content_type="application/octet-stream",
                headers={"Content-Disposition": f'inline; filename="{file_name}"'},
            )
            return response
        except (FileNotFoundError, OSError) as e:
            raise Http404("File not accessible") from e


class TestResultStepAttachmentViewSet(
    mixins.ListModelMixin,
    mixins.CreateModelMixin,
    viewsets.GenericViewSet,
):
    queryset = TestResultStepAttachment.objects.all()
    serializer_class = TestResultStepAttachmentSerializer
    pagination_class = None  # Disable pagination

    def get_queryset(self):
        test_result_id = self.kwargs["test_result_id"]
        # Get all attachments for result steps that belong to the given test result
        return TestResultStepAttachment.objects.filter(
            result_step__result_id=test_result_id
        ).select_related("result_step")

    def get_serializer_class(self):
        if self.action == "create":
            return TestResultStepAttachmentCreateSerializer
        return super().get_serializer_class()

    # This schema cannot be used in client because OpenAPI doesn't support array of files in multipart/form-data
    @extend_schema(
        request={
            "multipart/form-data": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "result_step": {
                            "type": "integer",
                            "description": "ID of the test result step",
                        },
                        "file": {
                            "type": "string",
                            "format": "binary",
                            "description": "File to attach",
                        },
                    },
                    "required": ["result_step", "file"],
                },
            }
        },
        responses={
            201: {
                "type": "array",
                "items": {"$ref": "#/components/schemas/TestResultStepAttachment"},
            }
        },
        description="Create multiple test result step attachments at once. Replaces all existing attachments for the given test result. Expects an array of test result step attachment objects in the request data.",
    )
    def create(self, request, *args, **kwargs):
        """
        Create multiple test result step attachments at once.
        Replaces all existing attachments for the given test result.
        """
        test_result_id = self.kwargs["test_result_id"]

        # Parse multipart form data
        attachments_data = []
        index = 0
        while True:
            result_step_key = f"{index}_result_step"
            file_key = f"{index}_file"

            if result_step_key not in request.data or file_key not in request.data:
                break

            attachments_data.append(
                {
                    "result_step": int(request.data[result_step_key]),
                    "file": request.data[file_key],
                }
            )
            index += 1

        if not attachments_data:
            return Response(
                {"error": "No attachment data provided"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Replace all attachments in a single transaction
        with transaction.atomic():
            # Delete all existing test result step attachments for this test result
            TestResultStepAttachment.objects.filter(
                result_step__result_id=test_result_id
            ).delete()

            # Create all new attachments
            created_attachments = []
            for attachment_data in attachments_data:
                # Check if TestResultStep associated with the test result and the order exists
                result_step_order = attachment_data.get("result_step")
                if result_step_order is not None:
                    try:
                        result_step = TestResultStep.objects.get(
                            order=result_step_order, result_id=test_result_id
                        )
                        attachment_data["result_step"] = result_step.pk
                    except TestResultStep.DoesNotExist:
                        return Response(
                            {
                                "error": f"Test result step {result_step_order} not found or does not belong to test result {test_result_id}"
                            },
                            status=status.HTTP_400_BAD_REQUEST,
                        )

                serializer = self.get_serializer(data=attachment_data)
                if not serializer.is_valid():
                    return Response(
                        serializer.errors, status=status.HTTP_400_BAD_REQUEST
                    )
                attachment = serializer.save()
                created_attachments.append(attachment)

        # Return the created ones
        response_serializer = TestResultStepAttachmentSerializer(
            created_attachments, many=True
        )
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)

    @extend_schema(
        responses={
            200: {
                "type": "string",
                "format": "binary",
                "description": "The file content",
            },
            404: {"type": "object", "properties": {"detail": {"type": "string"}}},
        },
        description="Download the attachment file through Django proxy",
    )
    @action(detail=True, methods=["get"])
    def download(self, request, *args, **kwargs):
        """Download the attachment file through Django proxy"""
        attachment = self.get_object()

        if not attachment.file:
            raise Http404("File not found")

        try:
            # Get file name for the response
            file_name = (
                attachment.file.name.split("/")[-1]
                if attachment.file.name
                else "attachment"
            )

            # Stream the file through Django
            response = FileResponse(
                attachment.file.open("rb"),
                content_type="application/octet-stream",
                headers={"Content-Disposition": f'inline; filename="{file_name}"'},
            )
            return response
        except (FileNotFoundError, OSError) as e:
            raise Http404("File not accessible") from e
