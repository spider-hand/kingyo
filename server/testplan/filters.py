import django_filters

from .models import TestPlan, TestCase, TestResult
from .constants import TEST_PLAN_STATUS, TEST_CASE_STATUS, TEST_CASE_RESULTS


class TestPlanFilter(django_filters.FilterSet):
    title = django_filters.CharFilter(lookup_expr="icontains")
    status = django_filters.ChoiceFilter(choices=TEST_PLAN_STATUS)

    class Meta:
        model = TestPlan
        fields = ["title", "status"]


class TestCaseFilter(django_filters.FilterSet):
    title = django_filters.CharFilter(lookup_expr="icontains")
    status = django_filters.ChoiceFilter(choices=TEST_CASE_STATUS)
    latest_result = django_filters.ChoiceFilter(choices=TEST_CASE_RESULTS)

    class Meta:
        model = TestCase
        fields = ["title", "status", "latest_result"]


class TestResultFilter(django_filters.FilterSet):
    case = django_filters.CharFilter(field_name="case__title", lookup_expr="icontains")
    result = django_filters.ChoiceFilter(choices=TEST_CASE_RESULTS)
    tester = django_filters.CharFilter(
        field_name="tester__username", lookup_expr="exact"
    )
    configuration = django_filters.CharFilter(method="filter_configuration")

    def filter_configuration(self, queryset, _, value):
        """Custom filter for configuration which is a computed property"""
        if not value:
            return queryset

        parts = value.split(" on ")
        if len(parts) == 2:
            browser, os = parts
            return queryset.filter(
                browser__iexact=browser.strip(), os__iexact=os.strip()
            )

        return queryset.none()

    class Meta:
        model = TestResult
        fields = ["case", "result", "tester", "configuration"]
