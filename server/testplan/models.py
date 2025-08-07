from django.db import models

# Create your models here.


class TestPlan(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(
        blank=True,
    )
    status = models.CharField(
        max_length=20,
        choices=[
            ("not_started", "Not Started"),
            ("in_progress", "In Progress"),
            ("completed", "Completed"),
        ],
        default="not_started",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name


class TestCase(models.Model):
    plan = models.ForeignKey(
        TestPlan, related_name="test_cases", on_delete=models.CASCADE
    )
    name = models.CharField(max_length=255)
    description = models.TextField(
        blank=True,
    )
    status = models.CharField(
        max_length=20,
        choices=[
            ("design", "Design"),
            ("ready", "Ready"),
            ("closed", "Closed"),
        ],
        default="design",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    executed_at = models.DateTimeField(
        blank=True,
    )
    latest_result = models.CharField(
        max_length=20,
        choices=[
            ("pass", "Pass"),
            ("fail", "Fail"),
            ("in_progress", "In Progress"),
        ],
        default="in_progress",
    )

    def __str__(self):
        return self.name


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
        choices=[
            ("pass", "Pass"),
            ("fail", "Fail"),
            ("in_progress", "In Progress"),
        ],
        default="in_progress",
    )
    browser = models.CharField(
        max_length=20,
        choices=[
            ("chrome", "Chrome"),
            ("firefox", "Firefox"),
            ("safari", "Safari"),
            ("edge", "Edge"),
            ("opera", "Opera"),
        ],
        default="chrome",
    )
    os = models.CharField(
        max_length=20,
        choices=[
            ("windows10", "Windows 10"),
            ("windows11", "Windows 11"),
            ("macos", "macOS"),
            ("linux", "Linux"),
            ("android", "Android"),
            ("ios", "iOS"),
        ],
        default="windows11",
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
        choices=[
            ("pass", "Pass"),
            ("fail", "Fail"),
            ("in_progress", "In Progress"),
        ],
        default="in_progress",
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
