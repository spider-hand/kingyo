from django.contrib.auth.models import User
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import override_settings
from rest_framework.test import APITestCase
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
import tempfile

from ..models import (
    TestPlan,
    TestCase as TestCaseModel,
    TestResult,
    TestStep,
    TestResultStep,
    TestStepAttachment,
    TestResultStepAttachment,
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


class TestStepAPITests(APITestCase):
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

        # Create test steps with different orders
        self.test_step_1 = TestStep.objects.create(
            case=self.test_case,
            order=1,
            action="First action",
            expected_result="First expected result",
        )
        self.test_step_2 = TestStep.objects.create(
            case=self.test_case,
            order=2,
            action="Second action",
            expected_result="Second expected result",
        )

    def authenticate(self):
        """Helper method to authenticate requests"""
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.access_token}")

    def test_list_test_steps_ordered_by_order(self):
        """Test that test steps are listed ordered by order and filtered by test case id"""
        self.authenticate()

        # Create another test case with steps to ensure filtering works
        other_test_case = TestCaseModel.objects.create(
            plan=self.test_plan, title="Other Test Case"
        )
        TestStep.objects.create(
            case=other_test_case,
            order=1,
            action="Other action",
            expected_result="Other expected result",
        )

        response = self.client.get(
            f"/api/v1/testplans/{self.test_plan.id}/testcases/{self.test_case.id}/teststeps/"
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

        # Check ordering by order field
        self.assertEqual(response.data[0]["order"], 1)
        self.assertEqual(response.data[1]["order"], 2)
        self.assertEqual(response.data[0]["action"], "First action")
        self.assertEqual(response.data[1]["action"], "Second action")

    def test_create_test_steps_replaces_existing(self):
        """Test creating test steps replaces existing ones and returns 201"""
        self.authenticate()

        # Verify initial steps exist
        initial_count = TestStep.objects.filter(case=self.test_case).count()
        self.assertEqual(initial_count, 2)

        # Create new steps data
        new_steps_data = [
            {
                "order": 1,
                "action": "New first action",
                "expected_result": "New first expected result",
            },
            {
                "order": 2,
                "action": "New second action",
                "expected_result": "New second expected result",
            },
            {
                "order": 3,
                "action": "New third action",
                "expected_result": "New third expected result",
            },
        ]

        response = self.client.post(
            f"/api/v1/testplans/{self.test_plan.id}/testcases/{self.test_case.id}/teststeps/",
            new_steps_data,
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(len(response.data), 3)

        # Verify old steps were deleted and new ones created
        final_count = TestStep.objects.filter(case=self.test_case).count()
        self.assertEqual(final_count, 3)

        # Verify the new data
        self.assertEqual(response.data[0]["action"], "New first action")
        self.assertEqual(response.data[1]["action"], "New second action")
        self.assertEqual(response.data[2]["action"], "New third action")

    def test_create_test_steps_invalid_request(self):
        """Test that invalid request data returns 400"""
        self.authenticate()

        # Invalid data - missing required order field
        invalid_steps_data = [
            {"action": "Action without order", "expected_result": "Expected result"}
        ]

        response = self.client.post(
            f"/api/v1/testplans/{self.test_plan.id}/testcases/{self.test_case.id}/teststeps/",
            invalid_steps_data,
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class TestResultStepAPITests(APITestCase):
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

        # Create test result steps with different orders
        self.test_result_step_1 = TestResultStep.objects.create(
            result=self.test_result,
            order=1,
            action="First result action",
            expected_result="First result expected",
            status="pass",
            comment="First comment",
        )
        self.test_result_step_2 = TestResultStep.objects.create(
            result=self.test_result,
            order=2,
            action="Second result action",
            expected_result="Second result expected",
            status="fail",
            comment="Second comment",
        )

    def authenticate(self):
        """Helper method to authenticate requests"""
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.access_token}")

    def test_list_test_result_steps_ordered_by_order(self):
        """Test that test result steps are listed ordered by order and filtered by test result id"""
        self.authenticate()

        # Create another test result with steps to ensure filtering works
        other_test_result = TestResult.objects.create(
            case=self.test_case,
            result="fail",
            browser="firefox",
            os="macos",
            tester=self.user,
        )
        TestResultStep.objects.create(
            result=other_test_result,
            order=1,
            action="Other result action",
            expected_result="Other result expected",
            status="skip",
        )

        response = self.client.get(
            f"/api/v1/testplans/{self.test_plan.id}/testcases/{self.test_case.id}/testresults/{self.test_result.id}/testresultsteps/"
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

        # Check ordering by order field
        self.assertEqual(response.data[0]["order"], 1)
        self.assertEqual(response.data[1]["order"], 2)
        self.assertEqual(response.data[0]["action"], "First result action")
        self.assertEqual(response.data[1]["action"], "Second result action")
        self.assertEqual(response.data[0]["status"], "pass")
        self.assertEqual(response.data[1]["status"], "fail")

    def test_create_test_result_steps_replaces_existing(self):
        """Test creating test result steps replaces existing ones and returns 201"""
        self.authenticate()

        # Verify initial steps exist
        initial_count = TestResultStep.objects.filter(result=self.test_result).count()
        self.assertEqual(initial_count, 2)

        # Create new steps data
        new_steps_data = [
            {
                "order": 1,
                "action": "New first result action",
                "expected_result": "New first result expected",
                "status": "pass",
                "comment": "New first comment",
            },
            {
                "order": 2,
                "action": "New second result action",
                "expected_result": "New second result expected",
                "status": "fail",
                "comment": "New second comment",
            },
            {
                "order": 3,
                "action": "New third result action",
                "expected_result": "New third result expected",
                "status": "skip",
                "comment": "New third comment",
            },
        ]

        response = self.client.post(
            f"/api/v1/testplans/{self.test_plan.id}/testcases/{self.test_case.id}/testresults/{self.test_result.id}/testresultsteps/",
            new_steps_data,
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(len(response.data), 3)

        # Verify old steps were deleted and new ones created
        final_count = TestResultStep.objects.filter(result=self.test_result).count()
        self.assertEqual(final_count, 3)

        # Verify the new data
        self.assertEqual(response.data[0]["action"], "New first result action")
        self.assertEqual(response.data[1]["action"], "New second result action")
        self.assertEqual(response.data[2]["action"], "New third result action")
        self.assertEqual(response.data[0]["status"], "pass")
        self.assertEqual(response.data[1]["status"], "fail")
        self.assertEqual(response.data[2]["status"], "skip")

    def test_create_test_result_steps_invalid_request(self):
        """Test that invalid request data returns 400"""
        self.authenticate()

        # Invalid data - missing required order field
        invalid_steps_data = [
            {
                "action": "Action without order",
                "expected_result": "Expected result",
                "status": "pass",
            }
        ]

        response = self.client.post(
            f"/api/v1/testplans/{self.test_plan.id}/testcases/{self.test_case.id}/testresults/{self.test_result.id}/testresultsteps/",
            invalid_steps_data,
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


@override_settings(
    STORAGES={
        "default": {
            "BACKEND": "django.core.files.storage.FileSystemStorage",
        },
        "staticfiles": {
            "BACKEND": "django.contrib.staticfiles.storage.StaticFilesStorage",
        },
    },
    MEDIA_ROOT=tempfile.mkdtemp(),
)
class TestStepAttachmentAPITests(APITestCase):
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

        # Create test steps
        self.test_step_1 = TestStep.objects.create(
            case=self.test_case,
            order=1,
            action="First action",
            expected_result="First expected result",
        )
        self.test_step_2 = TestStep.objects.create(
            case=self.test_case,
            order=2,
            action="Second action",
            expected_result="Second expected result",
        )

    def authenticate(self):
        """Helper method to authenticate requests"""
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.access_token}")

    def test_list_test_step_attachments_filtered_by_test_case(self):
        """Test that test step attachments are filtered by test case as defined in get_queryset"""
        self.authenticate()

        # Create test step attachments
        TestStepAttachment.objects.create(step=self.test_step_1)
        TestStepAttachment.objects.create(step=self.test_step_2)

        # Create another test case with steps and attachments to ensure filtering works
        other_test_case = TestCaseModel.objects.create(
            plan=self.test_plan, title="Other Test Case"
        )
        other_step = TestStep.objects.create(
            case=other_test_case,
            order=1,
            action="Other action",
            expected_result="Other expected result",
        )
        TestStepAttachment.objects.create(step=other_step)

        response = self.client.get(
            f"/api/v1/testplans/{self.test_plan.id}/testcases/{self.test_case.id}/teststepattachments/"
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

        # Verify attachments belong to the correct test case
        returned_step_ids = [attachment["step"] for attachment in response.data]
        self.assertIn(self.test_step_1.id, returned_step_ids)
        self.assertIn(self.test_step_2.id, returned_step_ids)

    def test_create_test_step_attachments_multiple_and_return_201(self):
        """Test creating multiple test step attachments at once and return 201"""
        self.authenticate()

        # Create new attachment files
        file1 = SimpleUploadedFile(
            "new_file1.txt", b"new content 1", content_type="text/plain"
        )
        file2 = SimpleUploadedFile(
            "new_file2.txt", b"new content 2", content_type="text/plain"
        )

        # Prepare multipart form data
        data = {
            "0_step": str(self.test_step_1.order),
            "0_file": file1,
            "1_step": str(self.test_step_2.order),
            "1_file": file2,
        }

        response = self.client.post(
            f"/api/v1/testplans/{self.test_plan.id}/testcases/{self.test_case.id}/teststepattachments/",
            data,
            format="multipart",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(len(response.data), 2)

        # Verify attachments were created
        final_count = TestStepAttachment.objects.filter(
            step__case=self.test_case
        ).count()
        self.assertEqual(final_count, 2)

    def test_create_test_step_attachments_no_data_returns_400(self):
        """Test that providing no attachment data returns 400"""
        self.authenticate()

        response = self.client.post(
            f"/api/v1/testplans/{self.test_plan.id}/testcases/{self.test_case.id}/teststepattachments/",
            {},
            format="multipart",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("error", response.data)

    def test_create_test_step_attachments_invalid_step_returns_400(self):
        """Test that referencing non-existent step returns 400"""
        self.authenticate()

        file1 = SimpleUploadedFile(
            "new_file.txt", b"new content", content_type="text/plain"
        )

        # Use a step order that doesn't exist
        data = {
            "0_step": "999",
            "0_file": file1,
        }

        response = self.client.post(
            f"/api/v1/testplans/{self.test_plan.id}/testcases/{self.test_case.id}/teststepattachments/",
            data,
            format="multipart",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("error", response.data)

    def test_create_test_step_attachments_with_exe_file_returns_400(self):
        """Test that uploading a .exe file returns 400"""
        self.authenticate()

        exe_file = SimpleUploadedFile(
            "malicious.exe",
            b"fake exe content",
            content_type="application/x-msdownload",
        )
        data = {
            "0_step": str(self.test_step_1.order),
            "0_file": exe_file,
        }
        response = self.client.post(
            f"/api/v1/testplans/{self.test_plan.id}/testcases/{self.test_case.id}/teststepattachments/",
            data,
            format="multipart",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("error", response.data)

    def test_download_attachment_returns_file_response(self):
        """Test that download endpoint returns file response"""
        self.authenticate()

        # Create attachment with file
        file_content = SimpleUploadedFile(
            "test_file.txt", b"test content", content_type="text/plain"
        )
        attachment = TestStepAttachment.objects.create(
            step=self.test_step_1, file=file_content
        )

        response = self.client.get(
            f"/api/v1/testplans/{self.test_plan.id}/testcases/{self.test_case.id}/teststepattachments/{attachment.id}/download/"
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response["Content-Type"], "application/octet-stream")
        self.assertIn("Content-Disposition", response.headers)

    def test_download_attachment_no_file_returns_404(self):
        """Test that download endpoint returns 404 when file is not found"""
        self.authenticate()

        # Create attachment without file
        attachment_no_file = TestStepAttachment.objects.create(step=self.test_step_1)

        response = self.client.get(
            f"/api/v1/testplans/{self.test_plan.id}/testcases/{self.test_case.id}/teststepattachments/{attachment_no_file.id}/download/"
        )

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_download_attachment_file_not_accessible_returns_404(self):
        """Test that download endpoint returns 404 when file is not accessible"""
        self.authenticate()

        # Create attachment with file path that doesn't exist
        attachment = TestStepAttachment.objects.create(step=self.test_step_1)
        attachment.file.name = "non_existent_file.txt"
        attachment.save()

        response = self.client.get(
            f"/api/v1/testplans/{self.test_plan.id}/testcases/{self.test_case.id}/teststepattachments/{attachment.id}/download/"
        )

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)


@override_settings(
    STORAGES={
        "default": {
            "BACKEND": "django.core.files.storage.FileSystemStorage",
        },
        "staticfiles": {
            "BACKEND": "django.contrib.staticfiles.storage.StaticFilesStorage",
        },
    },
    MEDIA_ROOT=tempfile.mkdtemp(),
)
class TestResultStepAttachmentAPITests(APITestCase):
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

        # Create test result steps
        self.test_result_step_1 = TestResultStep.objects.create(
            result=self.test_result,
            order=1,
            action="First result action",
            expected_result="First result expected",
            status="pass",
        )
        self.test_result_step_2 = TestResultStep.objects.create(
            result=self.test_result,
            order=2,
            action="Second result action",
            expected_result="Second result expected",
            status="fail",
        )

    def authenticate(self):
        """Helper method to authenticate requests"""
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.access_token}")

    def test_list_test_result_step_attachments_filtered_by_test_result(self):
        """Test that test result step attachments are filtered by test result as defined in get_queryset"""
        self.authenticate()

        # Create test result step attachments
        TestResultStepAttachment.objects.create(result_step=self.test_result_step_1)
        TestResultStepAttachment.objects.create(result_step=self.test_result_step_2)

        # Create another test result with steps and attachments to ensure filtering works
        other_test_result = TestResult.objects.create(
            case=self.test_case,
            result="fail",
            browser="firefox",
            os="macos",
            tester=self.user,
        )
        other_result_step = TestResultStep.objects.create(
            result=other_test_result,
            order=1,
            action="Other result action",
            expected_result="Other result expected",
            status="skip",
        )
        TestResultStepAttachment.objects.create(result_step=other_result_step)

        response = self.client.get(
            f"/api/v1/testplans/{self.test_plan.id}/testcases/{self.test_case.id}/testresults/{self.test_result.id}/testresultstepattachments/"
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

        # Verify attachments belong to the correct test result
        returned_step_ids = [attachment["result_step"] for attachment in response.data]
        self.assertIn(self.test_result_step_1.id, returned_step_ids)
        self.assertIn(self.test_result_step_2.id, returned_step_ids)

    def test_create_test_result_step_attachments_multiple_and_return_201(self):
        """Test creating multiple test result step attachments at once and return 201"""
        self.authenticate()

        # Create new attachment files
        file1 = SimpleUploadedFile(
            "new_result_file1.txt", b"new result content 1", content_type="text/plain"
        )
        file2 = SimpleUploadedFile(
            "new_result_file2.txt", b"new result content 2", content_type="text/plain"
        )

        # Prepare multipart form data
        data = {
            "0_result_step": str(self.test_result_step_1.order),
            "0_file": file1,
            "1_result_step": str(self.test_result_step_2.order),
            "1_file": file2,
        }

        response = self.client.post(
            f"/api/v1/testplans/{self.test_plan.id}/testcases/{self.test_case.id}/testresults/{self.test_result.id}/testresultstepattachments/",
            data,
            format="multipart",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(len(response.data), 2)

        # Verify attachments were created
        final_count = TestResultStepAttachment.objects.filter(
            result_step__result=self.test_result
        ).count()
        self.assertEqual(final_count, 2)

    def test_create_test_result_step_attachments_no_data_returns_400(self):
        """Test that providing no attachment data returns 400"""
        self.authenticate()

        response = self.client.post(
            f"/api/v1/testplans/{self.test_plan.id}/testcases/{self.test_case.id}/testresults/{self.test_result.id}/testresultstepattachments/",
            {},
            format="multipart",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("error", response.data)

    def test_create_test_result_step_attachments_invalid_step_returns_400(self):
        """Test that referencing non-existent result step returns 400"""
        self.authenticate()

        file1 = SimpleUploadedFile(
            "new_result_file.txt", b"new result content", content_type="text/plain"
        )

        # Use a result step order that doesn't exist
        data = {
            "0_result_step": "999",
            "0_file": file1,
        }

        response = self.client.post(
            f"/api/v1/testplans/{self.test_plan.id}/testcases/{self.test_case.id}/testresults/{self.test_result.id}/testresultstepattachments/",
            data,
            format="multipart",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("error", response.data)

    def test_create_test_result_step_attachments_with_exe_file_returns_400(self):
        """Test that uploading a .exe file returns 400"""
        self.authenticate()

        exe_file = SimpleUploadedFile(
            "malicious.exe",
            b"fake exe content",
            content_type="application/x-msdownload",
        )
        data = {
            "0_result_step": str(self.test_result_step_1.order),
            "0_file": exe_file,
        }
        response = self.client.post(
            f"/api/v1/testplans/{self.test_plan.id}/testcases/{self.test_case.id}/testresults/{self.test_result.id}/testresultstepattachments/",
            data,
            format="multipart",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("error", response.data)

    def test_download_result_attachment_returns_file_response(self):
        """Test that download endpoint returns file response"""
        self.authenticate()

        # Create attachment with file
        file_content = SimpleUploadedFile(
            "test_result_file.txt", b"test result content", content_type="text/plain"
        )
        attachment = TestResultStepAttachment.objects.create(
            result_step=self.test_result_step_1, file=file_content
        )

        response = self.client.get(
            f"/api/v1/testplans/{self.test_plan.id}/testcases/{self.test_case.id}/testresults/{self.test_result.id}/testresultstepattachments/{attachment.id}/download/"
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response["Content-Type"], "application/octet-stream")
        self.assertIn("Content-Disposition", response.headers)

    def test_download_result_attachment_no_file_returns_404(self):
        """Test that download endpoint returns 404 when file is not found"""
        self.authenticate()

        # Create attachment without file
        attachment_no_file = TestResultStepAttachment.objects.create(
            result_step=self.test_result_step_1
        )

        response = self.client.get(
            f"/api/v1/testplans/{self.test_plan.id}/testcases/{self.test_case.id}/testresults/{self.test_result.id}/testresultstepattachments/{attachment_no_file.id}/download/"
        )

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_download_result_attachment_file_not_accessible_returns_404(self):
        """Test that download endpoint returns 404 when file is not accessible"""
        self.authenticate()

        # Create attachment with file path that doesn't exist
        attachment = TestResultStepAttachment.objects.create(
            result_step=self.test_result_step_1
        )
        attachment.file.name = "non_existent_result_file.txt"
        attachment.save()

        response = self.client.get(
            f"/api/v1/testplans/{self.test_plan.id}/testcases/{self.test_case.id}/testresults/{self.test_result.id}/testresultstepattachments/{attachment.id}/download/"
        )

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
