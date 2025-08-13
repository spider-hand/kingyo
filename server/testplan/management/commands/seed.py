from django.core.management.base import BaseCommand
from django.core.management import call_command
from django.contrib.auth.models import User
from testplan.models import TestPlan, TestCase, TestResult
from faker import Faker
from testplan.constants import (
    TEST_PLAN_STATUS,
    TEST_CASE_STATUS,
    TEST_CASE_RESULTS,
    BROWSER_LIST,
    OS_LIST,
)
from environ import Env

env = Env()
env.read_env()


class Command(BaseCommand):
    help = "Seed the database"

    def handle(self, *args, **options):
        # Reset the database
        call_command("flush", interactive=False)
        call_command("migrate", interactive=False)

        username = env.str("DJANGO_SUPERUSER_USERNAME", default="admin")
        email = env.str("DJANGO_SUPERUSER_EMAIL", default="admin@example.com")
        password = env.str("DJANGO_SUPERUSER_PASSWORD", default="password")

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

        fake = Faker()
        for _ in range(100):
            test_plan = TestPlan.objects.create(
                title=fake.catch_phrase(),
                description=fake.paragraph(),
                status=fake.random_element(TEST_PLAN_STATUS)[0],
            )

            for _ in range(100):
                test_case = TestCase.objects.create(
                    plan=test_plan,
                    title=fake.catch_phrase(),
                    description=fake.paragraph(),
                    status=fake.random_element(TEST_CASE_STATUS)[0],
                )

                for _ in range(10):
                    TestResult.objects.create(
                        case=test_case,
                        tester=superuser,
                        result=fake.random_element(TEST_CASE_RESULTS)[0],
                        browser=fake.random_element(BROWSER_LIST)[0],
                        os=fake.random_element(OS_LIST)[0],
                    )

        self.stdout.write(self.style.SUCCESS("Seed data created successfully."))
