from django.test import TestCase
from django.contrib.auth.models import User

from ..models import TestPlan, TestCase as TestCaseModel, TestResult
from ..filters import TestPlanFilter, TestCaseFilter, TestResultFilter


class TestPlanFilterTests(TestCase):
    def setUp(self):
        self.test_plan1 = TestPlan.objects.create(
            title="Login Test Plan", status="not_started"
        )
        self.test_plan2 = TestPlan.objects.create(
            title="Registration Flow", status="in_progress"
        )
        self.test_plan3 = TestPlan.objects.create(
            title="Dashboard Tests", status="completed"
        )

    def test_title_filter(self):
        """Test filtering test plans by title"""
        filter_set = TestPlanFilter(
            data={"title": "login"}, queryset=TestPlan.objects.all()
        )
        self.assertTrue(filter_set.is_valid())
        filtered_plans = filter_set.qs
        self.assertEqual(filtered_plans.count(), 1)
        self.assertEqual(filtered_plans.first(), self.test_plan1)

    def test_status_filter(self):
        """Test filtering test plans by status"""
        filter_set = TestPlanFilter(
            data={"status": "in_progress"}, queryset=TestPlan.objects.all()
        )
        self.assertTrue(filter_set.is_valid())
        filtered_plans = filter_set.qs
        self.assertEqual(filtered_plans.count(), 1)
        self.assertEqual(filtered_plans.first(), self.test_plan2)

    def test_combined_filters(self):
        """Test combining multiple filters"""
        filter_set = TestPlanFilter(
            data={"title": "test", "status": "completed"},
            queryset=TestPlan.objects.all(),
        )
        self.assertTrue(filter_set.is_valid())
        filtered_plans = filter_set.qs
        self.assertEqual(filtered_plans.count(), 1)
        self.assertEqual(filtered_plans.first(), self.test_plan3)


class TestCaseFilterTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="testuser", email="test@example.com", password="testpass123"
        )

        self.test_plan = TestPlan.objects.create(title="Test Plan")

        self.test_case1 = TestCaseModel.objects.create(
            plan=self.test_plan, title="Login Test Case", status="design"
        )
        self.test_case2 = TestCaseModel.objects.create(
            plan=self.test_plan, title="Logout Test Case", status="ready"
        )
        self.test_case3 = TestCaseModel.objects.create(
            plan=self.test_plan, title="Dashboard Case", status="closed"
        )

        # Create test results for latest_result filtering
        TestResult.objects.create(
            case=self.test_case1,
            result="pass",
            browser="chrome",
            os="windows10",
            tester=self.user,
        )
        TestResult.objects.create(
            case=self.test_case2,
            result="fail",
            browser="firefox",
            os="macos",
            tester=self.user,
        )

    def test_title_filter(self):
        """Test filtering test cases by title"""
        filter_set = TestCaseFilter(
            data={"title": "login"}, queryset=TestCaseModel.objects.all()
        )
        self.assertTrue(filter_set.is_valid())
        filtered_cases = filter_set.qs
        self.assertEqual(filtered_cases.count(), 1)
        self.assertEqual(filtered_cases.first(), self.test_case1)

    def test_status_filter(self):
        """Test filtering test cases by status"""
        filter_set = TestCaseFilter(
            data={"status": "ready"}, queryset=TestCaseModel.objects.all()
        )
        self.assertTrue(filter_set.is_valid())
        filtered_cases = filter_set.qs
        self.assertEqual(filtered_cases.count(), 1)
        self.assertEqual(filtered_cases.first(), self.test_case2)

    def test_latest_result_filter(self):
        """Test filtering test cases by latest result"""
        filter_set = TestCaseFilter(
            data={"latest_result": "pass"}, queryset=TestCaseModel.objects.all()
        )
        self.assertTrue(filter_set.is_valid())
        filtered_cases = filter_set.qs
        self.assertEqual(filtered_cases.count(), 1)
        self.assertEqual(filtered_cases.first(), self.test_case1)


class TestResultFilterTests(TestCase):
    def setUp(self):
        self.user1 = User.objects.create_user(
            username="tester1", email="tester1@example.com", password="testpass123"
        )
        self.user2 = User.objects.create_user(
            username="tester2", email="tester2@example.com", password="testpass123"
        )

        self.test_plan = TestPlan.objects.create(title="Test Plan")
        self.test_case1 = TestCaseModel.objects.create(
            plan=self.test_plan, title="Login Test"
        )
        self.test_case2 = TestCaseModel.objects.create(
            plan=self.test_plan, title="Logout Test"
        )

        self.result1 = TestResult.objects.create(
            case=self.test_case1,
            result="pass",
            browser="chrome",
            os="windows10",
            tester=self.user1,
        )
        self.result2 = TestResult.objects.create(
            case=self.test_case2,
            result="fail",
            browser="firefox",
            os="macos",
            tester=self.user2,
        )
        self.result3 = TestResult.objects.create(
            case=self.test_case1,
            result="in_progress",
            browser="safari",
            os="ios",
            tester=self.user1,
        )

    def test_case_filter(self):
        """Test filtering test results by case title"""
        filter_set = TestResultFilter(
            data={"case": "login"}, queryset=TestResult.objects.all()
        )
        self.assertTrue(filter_set.is_valid())
        filtered_results = filter_set.qs
        self.assertEqual(filtered_results.count(), 2)
        self.assertIn(self.result1, filtered_results)
        self.assertIn(self.result3, filtered_results)

    def test_result_filter(self):
        """Test filtering test results by result value"""
        filter_set = TestResultFilter(
            data={"result": "fail"}, queryset=TestResult.objects.all()
        )
        self.assertTrue(filter_set.is_valid())
        filtered_results = filter_set.qs
        self.assertEqual(filtered_results.count(), 1)
        self.assertEqual(filtered_results.first(), self.result2)

    def test_tester_filter(self):
        """Test filtering test results by tester username"""
        filter_set = TestResultFilter(
            data={"tester": "tester1"}, queryset=TestResult.objects.all()
        )
        self.assertTrue(filter_set.is_valid())
        filtered_results = filter_set.qs
        self.assertEqual(filtered_results.count(), 2)
        self.assertIn(self.result1, filtered_results)
        self.assertIn(self.result3, filtered_results)

    def test_configuration_filter_valid_format(self):
        """Test filtering test results by configuration with valid format"""
        filter_set = TestResultFilter(
            data={"configuration": "chrome on windows10"},
            queryset=TestResult.objects.all(),
        )
        self.assertTrue(filter_set.is_valid())
        filtered_results = filter_set.qs
        self.assertEqual(filtered_results.count(), 1)
        self.assertEqual(filtered_results.first(), self.result1)

    def test_configuration_filter_case_insensitive(self):
        """Test configuration filter is case insensitive"""
        filter_set = TestResultFilter(
            data={"configuration": "FIREFOX on MacOS"},
            queryset=TestResult.objects.all(),
        )
        self.assertTrue(filter_set.is_valid())
        filtered_results = filter_set.qs
        self.assertEqual(filtered_results.count(), 1)
        self.assertEqual(filtered_results.first(), self.result2)

    def test_configuration_filter_with_spaces(self):
        """Test configuration filter handles extra spaces"""
        filter_set = TestResultFilter(
            data={"configuration": " safari  on  ios "},
            queryset=TestResult.objects.all(),
        )
        self.assertTrue(filter_set.is_valid())
        filtered_results = filter_set.qs
        self.assertEqual(filtered_results.count(), 1)
        self.assertEqual(filtered_results.first(), self.result3)

    def test_configuration_filter_invalid_format(self):
        """Test configuration filter with invalid format returns no results"""
        # Test with missing 'on' separator
        filter_set = TestResultFilter(
            data={"configuration": "chrome windows10"},
            queryset=TestResult.objects.all(),
        )
        self.assertTrue(filter_set.is_valid())
        filtered_results = filter_set.qs
        self.assertEqual(filtered_results.count(), 0)

    def test_configuration_filter_too_many_parts(self):
        """Test configuration filter with too many parts returns no results"""
        filter_set = TestResultFilter(
            data={"configuration": "chrome on windows on 10"},
            queryset=TestResult.objects.all(),
        )
        self.assertTrue(filter_set.is_valid())
        filtered_results = filter_set.qs
        self.assertEqual(filtered_results.count(), 0)

    def test_configuration_filter_empty_value(self):
        """Test configuration filter with empty value returns all results"""
        filter_set = TestResultFilter(
            data={"configuration": ""}, queryset=TestResult.objects.all()
        )
        self.assertTrue(filter_set.is_valid())
        filtered_results = filter_set.qs
        self.assertEqual(filtered_results.count(), 3)

    def test_configuration_filter_nonexistent_combination(self):
        """Test configuration filter with nonexistent browser/OS combination"""
        filter_set = TestResultFilter(
            data={"configuration": "nonexistent on nowhere"},
            queryset=TestResult.objects.all(),
        )
        self.assertTrue(filter_set.is_valid())
        filtered_results = filter_set.qs
        self.assertEqual(filtered_results.count(), 0)

    def test_combined_filters_with_configuration(self):
        """Test combining configuration filter with other filters"""
        filter_set = TestResultFilter(
            data={
                "configuration": "chrome on windows10",
                "result": "pass",
                "tester": "tester1",
            },
            queryset=TestResult.objects.all(),
        )
        self.assertTrue(filter_set.is_valid())
        filtered_results = filter_set.qs
        self.assertEqual(filtered_results.count(), 1)
        self.assertEqual(filtered_results.first(), self.result1)
