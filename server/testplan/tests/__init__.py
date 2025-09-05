# Test package for testplan app

# Import all test classes for Django test discovery
from .test_models import (
    TestPlanModelTests,
    TestCaseModelTests,
    TestStepModelTests,
    TestResultModelTests,
    TestStepAttachmentModelTests,
    TestResultStepModelTests,
)

from .test_apis import (
    TestPlanAPITests,
    TestCaseAPITests,
    TestResultAPITests,
)

from .test_filters import (
    TestPlanFilterTests,
    TestCaseFilterTests,
    TestResultFilterTests,
)

__all__ = [
    # Model tests
    "TestPlanModelTests",
    "TestCaseModelTests",
    "TestStepModelTests",
    "TestResultModelTests",
    "TestStepAttachmentModelTests",
    "TestResultStepModelTests",
    # API tests
    "TestPlanAPITests",
    "TestCaseAPITests",
    "TestResultAPITests",
    # Filter tests
    "TestPlanFilterTests",
    "TestCaseFilterTests",
    "TestResultFilterTests",
]
