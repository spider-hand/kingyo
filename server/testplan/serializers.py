from rest_framework import serializers
from .models import TestPlan


class TestPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = TestPlan
        fields = "__all__"
        read_only_fields = ["created_at", "updated_at"]


class TestPlanCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = TestPlan
        fields = ["name"]
        read_only_fields = ["created_at", "updated_at"]
