import django_filters

from .models import TestPlan
from .constants import TEST_PLAN_STATUS


class TestPlanFilter(django_filters.FilterSet):
    title = django_filters.CharFilter(lookup_expr="icontains")
    status = django_filters.ChoiceFilter(choices=TEST_PLAN_STATUS)

    class Meta:
        model = TestPlan
        fields = ["title", "status"]
