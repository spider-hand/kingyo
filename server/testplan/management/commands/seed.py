from django.core.management.base import BaseCommand
from django.core.management import call_command
from django.contrib.auth.models import User
from testplan.models import TestPlan, TestCase, TestStep, TestResult, TestResultStep
from faker import Faker
from testplan.constants import (
    TEST_PLAN_STATUS,
    TEST_CASE_STATUS,
    TEST_CASE_RESULTS,
    BROWSER_LIST,
    OS_LIST,
    TEST_RESULT_STEP_STATUS,
)
from environ import Env
from pathlib import Path

env = Env()
env.read_env()

BASE_DIR = Path(__file__).resolve().parent.parent.parent.parent


class Command(BaseCommand):
    """
    Seed the database with initial data for testing and development.
    """

    help = "Seed the database"

    def add_arguments(self, parser):
        parser.add_argument(
            "--plans",
            type=int,
            default=100,
            help="Number of test plans to create (default: 100)",
        )
        parser.add_argument(
            "--cases-per-plan",
            type=int,
            default=100,
            help="Number of test cases per plan (default: 100)",
        )
        parser.add_argument(
            "--steps-per-case",
            type=int,
            default=10,
            help="Number of test steps per case (default: 10)",
        )

    def handle(self, *args, **options):
        plans_count = options["plans"]
        cases_per_plan = options["cases_per_plan"]
        steps_per_case = options["steps_per_case"]

        # Reset the database
        call_command("flush", interactive=False)
        call_command("migrate", interactive=False)

        username = env.str("DJANGO_SUPERUSER_USERNAME")
        email = env.str("DJANGO_SUPERUSER_EMAIL")
        password = env.str("DJANGO_SUPERUSER_PASSWORD")

        self.stdout.write("Creating superuser..")

        call_command(
            "createsuperuser",
            username=username,
            email=email,
            interactive=False,
            verbosity=0,
        )

        superuser = User.objects.get(username=username)
        superuser.set_password(password)
        superuser.save()

        self.stdout.write(self.style.SUCCESS("Created superuser successfully."))

        self.stdout.write("Creating seed data..")

        fake = Faker()
        for _ in range(plans_count):
            test_plan = TestPlan.objects.create(
                title=fake.catch_phrase(),
                description=fake.paragraph(),
                status=fake.random_element(TEST_PLAN_STATUS)[0],
            )

            for _ in range(cases_per_plan):
                test_case = TestCase.objects.create(
                    plan=test_plan,
                    title=fake.catch_phrase(),
                    description=fake.paragraph(),
                    status=fake.random_element(TEST_CASE_STATUS)[0],
                )

                test_steps = []
                for step_idx in range(steps_per_case):
                    test_step = TestStep.objects.create(
                        case=test_case,
                        order=step_idx + 1,
                        action=fake.sentence(),
                        expected_result=fake.sentence(),
                    )
                    test_steps.append(test_step)

                test_result = TestResult.objects.create(
                    case=test_case,
                    tester=superuser,
                    result=fake.random_element(TEST_CASE_RESULTS)[0],
                    browser=fake.random_element(BROWSER_LIST)[0],
                    os=fake.random_element(OS_LIST)[0],
                )

                for test_step in test_steps:
                    TestResultStep.objects.create(
                        result=test_result,
                        step=test_step,
                        order=test_step.order,
                        action=test_step.action,
                        expected_result=test_step.expected_result,
                        status=fake.random_element(TEST_RESULT_STEP_STATUS)[0],
                        comment=fake.sentence()
                        if fake.boolean(chance_of_getting_true=30)
                        else "",
                    )

        self.stdout.write(self.style.SUCCESS("Seed data created successfully."))
