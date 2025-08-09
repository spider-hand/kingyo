# Register your models here.

from django.contrib import admin
from .models import (
    TestPlan,
    TestCase,
    TestStep,
    TestStepAttachment,
    TestResult,
    TestResultStep,
    TestResultStepAttachment,
)

admin.site.register(TestPlan)
admin.site.register(TestCase)
admin.site.register(TestStep)
admin.site.register(TestStepAttachment)
admin.site.register(TestResult)
admin.site.register(TestResultStep)
admin.site.register(TestResultStepAttachment)
