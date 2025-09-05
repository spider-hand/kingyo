from django.contrib.auth.models import User
from rest_framework.test import APITestCase
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken

from ..models import (
    TestPlan,
    TestCase as TestCaseModel,
    TestResult,
)


class TestPlanAPITests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="testuser", email="test@example.com", password="testpass123"
        )
        self.refresh = RefreshToken.for_user(self.user)
        self.access_token = str(self.refresh.access_token)

        self.test_plan = TestPlan.objects.create(
            title="API Test Plan", description="Test plan for API testing"
        )

    def authenticate(self):
        """Helper method to authenticate requests"""
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.access_token}")

    def test_list_test_plans(self):
        """Test listing test plans"""
        self.authenticate()
        response = self.client.get("/api/v1/testplans/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data["results"]), 1)
        self.assertEqual(response.data["results"][0]["title"], "API Test Plan")

    def test_retrieve_test_plan(self):
        """Test retrieving a specific test plan"""
        self.authenticate()
        response = self.client.get(f"/api/v1/testplans/{self.test_plan.id}/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["title"], "API Test Plan")

    def test_create_test_plan(self):
        """Test creating a new test plan"""
        self.authenticate()
        data = {"title": "New Test Plan"}
        response = self.client.post("/api/v1/testplans/", data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["title"], "New Test Plan")
        self.assertTrue(TestPlan.objects.filter(title="New Test Plan").exists())

    def test_unauthorized_access(self):
        """Test unauthorized access to test plans"""
        response = self.client.get("/api/v1/testplans/")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class TestCaseAPITests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="testuser", email="test@example.com", password="testpass123"
        )
        self.refresh = RefreshToken.for_user(self.user)
        self.access_token = str(self.refresh.access_token)

        self.test_plan = TestPlan.objects.create(title="Test Plan")
        self.test_case = TestCaseModel.objects.create(
            plan=self.test_plan,
            title="API Test Case",
            description="Test case for API testing",
        )

    def authenticate(self):
        """Helper method to authenticate requests"""
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.access_token}")

    def test_list_test_cases(self):
        """Test listing test cases"""
        self.authenticate()
        response = self.client.get(f"/api/v1/testplans/{self.test_plan.id}/testcases/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data["results"]), 1)
        self.assertEqual(response.data["results"][0]["title"], "API Test Case")

    def test_create_test_case(self):
        """Test creating a new test case"""
        self.authenticate()
        data = {
            "plan": self.test_plan.id,
            "title": "New Test Case",
            "description": "New test case description",
        }
        response = self.client.post(
            f"/api/v1/testplans/{self.test_plan.id}/testcases/", data
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["title"], "New Test Case")

    def test_filter_test_cases_by_plan(self):
        """Test filtering test cases by plan"""
        self.authenticate()
        # Create another plan and case
        other_plan = TestPlan.objects.create(title="Other Plan")
        TestCaseModel.objects.create(plan=other_plan, title="Other Case")

        response = self.client.get(f"/api/v1/testplans/{self.test_plan.id}/testcases/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data["results"]), 1)
        self.assertEqual(response.data["results"][0]["plan"], self.test_plan.id)


class TestResultAPITests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="testuser", email="test@example.com", password="testpass123"
        )
        self.refresh = RefreshToken.for_user(self.user)
        self.access_token = str(self.refresh.access_token)

        self.test_plan = TestPlan.objects.create(title="Test Plan")
        self.test_case = TestCaseModel.objects.create(
            plan=self.test_plan, title="Test Case"
        )
        self.test_result = TestResult.objects.create(
            case=self.test_case,
            result="pass",
            browser="chrome",
            os="windows10",
            tester=self.user,
        )

    def authenticate(self):
        """Helper method to authenticate requests"""
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.access_token}")

    def test_list_test_results(self):
        """Test listing test results"""
        self.authenticate()
        response = self.client.get(
            f"/api/v1/testplans/{self.test_plan.id}/testcases/{self.test_case.id}/testresults/"
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data["results"]), 1)
        self.assertEqual(response.data["results"][0]["result"], "pass")

    def test_create_test_result(self):
        """Test creating a new test result"""
        self.authenticate()
        data = {
            "case": self.test_case.id,
            "result": "fail",
            "browser": "firefox",
            "os": "macos",
            "tester": self.user.id,
        }
        response = self.client.post(
            f"/api/v1/testplans/{self.test_plan.id}/testcases/{self.test_case.id}/testresults/",
            data,
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["result"], "fail")
        self.assertEqual(response.data["tester"], self.user.id)
