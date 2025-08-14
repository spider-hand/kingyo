from rest_framework import serializers
from django.contrib.auth.models import User
from .models import TestPlan, TestCase, TestResult, TestStep, TestResultStep


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "first_name", "last_name", "email"]
        read_only_fields = ["id", "username", "first_name", "last_name", "email"]


class TestPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = TestPlan
        fields = "__all__"
        read_only_fields = ["created_at", "updated_at"]


class TestPlanCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = TestPlan
        fields = ["title"]
        read_only_fields = ["created_at", "updated_at"]


class TestCaseSerializer(serializers.ModelSerializer):
    executed_at = serializers.DateTimeField(read_only=True)
    latest_result = serializers.CharField(read_only=True)

    class Meta:
        model = TestCase
        fields = "__all__"
        read_only_fields = ["created_at", "updated_at", "executed_at", "latest_result"]


class TestResultSerializer(serializers.ModelSerializer):
    configuration = serializers.CharField(read_only=True)
    tester_username = serializers.CharField(source="tester.username", read_only=True)
    case_title = serializers.CharField(source="case.title", read_only=True)

    class Meta:
        model = TestResult
        fields = [
            "id",
            "case",
            "case_title",
            "result",
            "configuration",
            "tester",
            "tester_username",
            "executed_at",
            "updated_at",
        ]
        read_only_fields = [
            "executed_at",
            "updated_at",
            "configuration",
            "tester_username",
            "case_title",
        ]


class TestResultCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = TestResult
        # Need to include "id" explicitly to get access to the created TestResult object's ID on frontend
        fields = ["id", "case", "result", "browser", "os", "tester"]


class TestStepSerializer(serializers.ModelSerializer):
    class Meta:
        model = TestStep
        fields = ["id", "case", "order", "action", "expected_result"]


class TestResultStepSerializer(serializers.ModelSerializer):
    class Meta:
        model = TestResultStep
        fields = [
            "id",
            "result",
            "step",
            "order",
            "action",
            "expected_result",
            "status",
            "comment",
        ]


class TestResultStepCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating test result steps.
    The 'result' field will be automatically set from the URL parameter.
    """

    class Meta:
        model = TestResultStep
        fields = [
            "step",
            "order",
            "action",
            "expected_result",
            "status",
            "comment",
        ]
