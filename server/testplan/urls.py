from django.urls import path, include
from rest_framework import routers
from .views import TestPlanViewSet, TestCaseViewSet, TestResultViewSet

# Create router for top-level testplans
router = routers.DefaultRouter()
router.register(r"testplans", TestPlanViewSet)

# Define nested URLs manually
urlpatterns = [
    # Include the router URLs for testplans
    path("", include(router.urls)),
    # Nested test cases under test plans
    path(
        "testplans/<int:test_plan_id>/testcases/",
        TestCaseViewSet.as_view({"get": "list", "post": "create"}),
        name="testplan-testcases-list",
    ),
    path(
        "testplans/<int:test_plan_id>/testcases/<int:pk>/",
        TestCaseViewSet.as_view(
            {
                "get": "retrieve",
                "put": "update",
                "patch": "partial_update",
                "delete": "destroy",
            }
        ),
        name="testplan-testcases-detail",
    ),
    # List all the test results
    path(
        "testplans/<int:test_plan_id>/testresults/",
        TestResultViewSet.as_view({"get": "list"}),
        name="testplan-testresults-list",
    ),
    path(
        "testplans/<int:test_plan_id>/testcases/<int:test_case_id>/testresults/",
        TestResultViewSet.as_view({"get": "list", "post": "create"}),
        name="testcase-testresults-list",
    ),
    path(
        "testplans/<int:test_plan_id>/testcases/<int:test_case_id>/testresults/<int:pk>/",
        TestResultViewSet.as_view(
            {
                "get": "retrieve",
                "put": "update",
                "patch": "partial_update",
                "delete": "destroy",
            }
        ),
        name="testcase-testresults-detail",
    ),
]
