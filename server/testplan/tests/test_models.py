from django.test import TestCase, override_settings
from django.contrib.auth.models import User
from django.core.files.uploadedfile import SimpleUploadedFile
from django.db import IntegrityError

from ..models import (
    TestPlan,
    TestCase as TestCaseModel,
    TestStep,
    TestResult,
    TestResultStep,
    TestStepAttachment,
    TestResultStepAttachment,
)
from ..constants import TEST_PLAN_STATUS


class TestPlanModelTests(TestCase):
    def setUp(self):
        self.test_plan = TestPlan.objects.create(
            title="Sample Test Plan",
            description="This is a test plan description",
            status="not_started",
        )

    def test_test_plan_creation(self):
        """Test TestPlan model creation"""
        self.assertEqual(self.test_plan.title, "Sample Test Plan")
        self.assertEqual(self.test_plan.description, "This is a test plan description")
        self.assertEqual(self.test_plan.status, "not_started")
        self.assertIsNotNone(self.test_plan.created_at)
        self.assertIsNotNone(self.test_plan.updated_at)

    def test_test_plan_str_method(self):
        """Test TestPlan __str__ method"""
        self.assertEqual(str(self.test_plan), "Sample Test Plan")

    def test_test_plan_default_status(self):
        """Test TestPlan default status"""
        plan = TestPlan.objects.create(title="Test Default Status")
        self.assertEqual(plan.status, TEST_PLAN_STATUS[0][0])


class TestCaseModelTests(TestCase):
    def setUp(self):
        self.test_plan = TestPlan.objects.create(
            title="Sample Test Plan", description="Test plan for test cases"
        )
        self.test_case = TestCaseModel.objects.create(
            plan=self.test_plan,
            title="Sample Test Case",
            description="This is a test case description",
            status="design",
        )
        self.user = User.objects.create_user(
            username="testuser", email="test@example.com", password="testpass123"
        )

    def test_test_case_creation(self):
        """Test TestCase model creation"""
        self.assertEqual(self.test_case.title, "Sample Test Case")
        self.assertEqual(self.test_case.description, "This is a test case description")
        self.assertEqual(self.test_case.status, "design")
        self.assertEqual(self.test_case.plan, self.test_plan)

    def test_test_case_str_method(self):
        """Test TestCase __str__ method"""
        self.assertEqual(str(self.test_case), "Sample Test Case")

    def test_latest_test_result_property(self):
        """Test latest_test_result property when no results exist"""
        self.assertIsNone(self.test_case.latest_test_result)

    def test_latest_test_result_with_results(self):
        """Test latest_test_result property with multiple results"""
        # Create first result
        TestResult.objects.create(
            case=self.test_case,
            result="pass",
            browser="chrome",
            os="windows10",
            tester=self.user,
        )

        # Create second result (should be latest)
        result2 = TestResult.objects.create(
            case=self.test_case,
            result="fail",
            browser="firefox",
            os="macos",
            tester=self.user,
        )

        self.assertEqual(self.test_case.latest_test_result, result2)

    def test_executed_at_property(self):
        """Test executed_at property"""
        # Without results
        self.assertIsNone(self.test_case.executed_at)

        # With result
        TestResult.objects.create(
            case=self.test_case,
            result="pass",
            browser="chrome",
            os="windows10",
            tester=self.user,
        )
        self.assertIsNotNone(self.test_case.executed_at)

    def test_latest_result_property(self):
        """Test latest_result property"""
        # Without results
        self.assertIsNone(self.test_case.latest_result)

        # With result
        TestResult.objects.create(
            case=self.test_case,
            result="pass",
            browser="chrome",
            os="windows10",
            tester=self.user,
        )
        self.assertEqual(self.test_case.latest_result, "pass")


class TestStepModelTests(TestCase):
    def setUp(self):
        self.test_plan = TestPlan.objects.create(title="Test Plan")
        self.test_case = TestCaseModel.objects.create(
            plan=self.test_plan, title="Test Case"
        )
        self.test_step = TestStep.objects.create(
            case=self.test_case,
            order=1,
            action="Click login button",
            expected_result="User is redirected to dashboard",
        )

    def test_test_step_creation(self):
        """Test TestStep model creation"""
        self.assertEqual(self.test_step.case, self.test_case)
        self.assertEqual(self.test_step.order, 1)
        self.assertEqual(self.test_step.action, "Click login button")
        self.assertEqual(
            self.test_step.expected_result, "User is redirected to dashboard"
        )

    def test_test_step_str_method(self):
        """Test TestStep __str__ method"""
        self.assertEqual(str(self.test_step), "Step 1 for Test Case")

    def test_test_step_ordering(self):
        """Test TestStep ordering"""
        TestStep.objects.create(
            case=self.test_case, order=2, action="Enter credentials"
        )
        TestStep.objects.create(case=self.test_case, order=3, action="Verify dashboard")

        steps = list(TestStep.objects.filter(case=self.test_case))
        self.assertEqual(steps[0].order, 1)
        self.assertEqual(steps[1].order, 2)
        self.assertEqual(steps[2].order, 3)

    def test_unique_step_order_constraint(self):
        """Test unique constraint on case and order"""
        with self.assertRaises(IntegrityError):
            TestStep.objects.create(
                case=self.test_case,
                order=1,  # Same order as existing step
                action="Duplicate order",
            )


class TestResultModelTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="testuser", email="test@example.com", password="testpass123"
        )
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

    def test_test_result_creation(self):
        """Test TestResult model creation"""
        self.assertEqual(self.test_result.case, self.test_case)
        self.assertEqual(self.test_result.result, "pass")
        self.assertEqual(self.test_result.browser, "chrome")
        self.assertEqual(self.test_result.os, "windows10")
        self.assertEqual(self.test_result.tester, self.user)
        self.assertIsNotNone(self.test_result.executed_at)

    def test_configuration_property(self):
        """Test configuration property"""
        self.assertEqual(self.test_result.configuration, "chrome on windows10")


@override_settings(
    STORAGES={
        "default": {
            "BACKEND": "django.core.files.storage.FileSystemStorage",
        },
    },
    MEDIA_ROOT="/tmp/test_media",
)
class TestStepAttachmentModelTests(TestCase):
    def setUp(self):
        self.test_plan = TestPlan.objects.create(title="Test Plan")
        self.test_case = TestCaseModel.objects.create(
            plan=self.test_plan, title="Test Case"
        )
        self.test_step = TestStep.objects.create(
            case=self.test_case, order=1, action="Test action"
        )

    def test_test_step_attachment_creation(self):
        """Test TestStepAttachment model creation"""
        # Create a temporary file
        test_file = SimpleUploadedFile(
            "test_file.txt", b"test content", content_type="text/plain"
        )

        attachment = TestStepAttachment.objects.create(
            step=self.test_step, file=test_file
        )

        self.assertEqual(attachment.step, self.test_step)
        # Just check that the file has a name (it might have a different format than expected)
        self.assertTrue(attachment.file.name)
        self.assertTrue("test_file" in attachment.file.name)


class TestResultStepModelTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="testuser", email="test@example.com", password="testpass123"
        )
        self.test_plan = TestPlan.objects.create(title="Test Plan")
        self.test_case = TestCaseModel.objects.create(
            plan=self.test_plan, title="Test Case"
        )
        self.test_step = TestStep.objects.create(
            case=self.test_case, order=1, action="Test action"
        )
        self.test_result = TestResult.objects.create(
            case=self.test_case,
            result="pass",
            browser="chrome",
            os="windows10",
            tester=self.user,
        )
        self.result_step = TestResultStep.objects.create(
            result=self.test_result,
            step=self.test_step,
            order=1,
            action="Executed action",
            expected_result="Expected outcome",
            status="pass",
            comment="Test passed successfully",
        )

    def test_result_step_creation(self):
        """Test TestResultStep model creation"""
        self.assertEqual(self.result_step.result, self.test_result)
        self.assertEqual(self.result_step.step, self.test_step)
        self.assertEqual(self.result_step.order, 1)
        self.assertEqual(self.result_step.status, "pass")
        self.assertEqual(self.result_step.comment, "Test passed successfully")

    def test_result_step_ordering(self):
        """Test TestResultStep ordering"""
        TestResultStep.objects.create(
            result=self.test_result,
            step=self.test_step,
            order=2,
            action="Second action",
            status="fail",
        )

        steps = list(TestResultStep.objects.filter(result=self.test_result))
        self.assertEqual(steps[0].order, 1)
        self.assertEqual(steps[1].order, 2)


@override_settings(
    STORAGES={
        "default": {
            "BACKEND": "django.core.files.storage.FileSystemStorage",
        },
    },
    MEDIA_ROOT="/tmp/test_media",
)
class TestResultStepAttachmentModelTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="testuser", email="test@example.com", password="testpass123"
        )
        self.test_plan = TestPlan.objects.create(title="Test Plan")
        self.test_case = TestCaseModel.objects.create(
            plan=self.test_plan, title="Test Case"
        )
        self.test_step = TestStep.objects.create(
            case=self.test_case, order=1, action="Test action"
        )
        self.test_result = TestResult.objects.create(
            case=self.test_case,
            result="pass",
            browser="chrome",
            os="windows10",
            tester=self.user,
        )
        self.result_step = TestResultStep.objects.create(
            result=self.test_result,
            step=self.test_step,
            order=1,
            action="Executed action",
            expected_result="Expected outcome",
            status="pass",
        )

    def test_test_result_step_attachment_creation(self):
        """Test TestResultStepAttachment model creation"""
        # Create a temporary file
        test_file = SimpleUploadedFile(
            "result_test_file.txt", b"result test content", content_type="text/plain"
        )

        attachment = TestResultStepAttachment.objects.create(
            result_step=self.result_step, file=test_file
        )

        self.assertEqual(attachment.result_step, self.result_step)
        # Just check that the file has a name and is in the correct upload path
        self.assertTrue(attachment.file.name)
        self.assertTrue("result_test_file" in attachment.file.name)
        self.assertTrue("result_attachments/" in attachment.file.name)

    def test_test_result_step_attachment_relationship(self):
        """Test TestResultStepAttachment relationship with TestResultStep"""
        # Create a temporary file
        test_file = SimpleUploadedFile(
            "relationship_test.txt", b"relationship content", content_type="text/plain"
        )

        attachment = TestResultStepAttachment.objects.create(
            result_step=self.result_step, file=test_file
        )

        # Test that the attachment is accessible from the result step
        self.assertIn(attachment, self.result_step.attachments.all())

    def test_test_result_step_attachment_upload_path(self):
        """Test TestResultStepAttachment uses correct upload path"""
        # Create a temporary file
        test_file = SimpleUploadedFile(
            "upload_path_test.png", b"fake image content", content_type="image/png"
        )

        attachment = TestResultStepAttachment.objects.create(
            result_step=self.result_step, file=test_file
        )

        # Verify the file is uploaded to the result_attachments/ directory
        self.assertTrue(attachment.file.name.startswith("result_attachments/"))
