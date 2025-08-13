from django.db import models

from .constants import (
    TEST_PLAN_STATUS,
    TEST_CASE_STATUS,
    TEST_CASE_RESULTS,
    BROWSER_LIST,
    OS_LIST,
)

# Create your models here.


class TestPlan(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField(
        blank=True,
    )
    status = models.CharField(
        max_length=20,
        choices=TEST_PLAN_STATUS,
        default=TEST_PLAN_STATUS[0][0],
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title


class TestCase(models.Model):
    plan = models.ForeignKey(
        TestPlan, related_name="test_cases", on_delete=models.CASCADE
    )
    title = models.CharField(max_length=255)
    description = models.TextField(
        blank=True,
    )
    status = models.CharField(
        max_length=20,
        choices=TEST_CASE_STATUS,
        default=TEST_CASE_STATUS[0][0],
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    @property
    def latest_test_result(self):
        """Get the latest test result for this test case."""
        return self.test_results.order_by("-executed_at").first()

    @property
    def executed_at(self):
        """Get the execution time of the latest test result."""
        latest_result = self.latest_test_result
        return latest_result.executed_at if latest_result else None

    @property
    def latest_result(self):
        """Get the result of the latest test execution."""
        latest_result = self.latest_test_result
        return latest_result.result if latest_result else None

    def __str__(self):
        return self.title


class TestStep(models.Model):
    case = models.ForeignKey(
        TestCase, related_name="test_steps", on_delete=models.CASCADE
    )
    order = models.PositiveIntegerField()
    action = models.TextField(
        blank=True,
    )
    expected_result = models.TextField(
        blank=True,
    )

    class Meta:
        ordering = ["order"]
        constraints = [
            models.UniqueConstraint(
                fields=["case", "order"],
                name="unique_step_order_per_case",
            )
        ]

    def __str__(self):
        return f"Step {self.order} for {self.case.name}"


class TestStepAttachment(models.Model):
    step = models.ForeignKey(
        TestStep, related_name="attachments", on_delete=models.CASCADE
    )
    file = models.FileField(upload_to="attachments/")


class TestResult(models.Model):
    case = models.ForeignKey(
        TestCase, related_name="test_results", on_delete=models.CASCADE
    )
    result = models.CharField(
        max_length=20,
        choices=TEST_CASE_RESULTS,
        default=TEST_CASE_RESULTS[0][0],
    )
    browser = models.CharField(
        max_length=20,
        choices=BROWSER_LIST,
        default=BROWSER_LIST[0][0],
    )
    os = models.CharField(
        max_length=20,
        choices=OS_LIST,
        default=OS_LIST[0][0],
    )
    tester = models.ForeignKey(
        "auth.User", related_name="test_results", on_delete=models.CASCADE
    )
    executed_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    @property
    def configuration(self):
        return f"{self.browser} on {self.os}"


class TestResultStep(models.Model):
    result = models.ForeignKey(
        TestResult, related_name="result_steps", on_delete=models.CASCADE
    )
    step = models.ForeignKey(
        TestStep, related_name="result_steps", on_delete=models.CASCADE
    )
    order = models.PositiveIntegerField()
    action = models.TextField(
        blank=True,
    )
    expected_result = models.TextField(
        blank=True,
    )
    status = models.CharField(
        max_length=20,
        choices=TEST_CASE_RESULTS,
        default=TEST_CASE_RESULTS[0][0],
    )
    comment = models.TextField(
        blank=True,
    )

    class Meta:
        ordering = ["order"]
        constraints = [
            models.UniqueConstraint(
                fields=["result", "order"],
                name="unique_result_step_order_per_result",
            )
        ]


class TestResultStepAttachment(models.Model):
    result_step = models.ForeignKey(
        TestResultStep, related_name="attachments", on_delete=models.CASCADE
    )
    file = models.FileField(upload_to="result_attachments/")
