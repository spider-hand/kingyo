from django.core.management.base import BaseCommand
from django.core.management import call_command
from testplan.models import TestPlan
from faker import Faker
from testplan.constants import TEST_PLAN_STATUS


class Command(BaseCommand):
    help = "Seed the database"

    def handle(self, *args, **options):
        # Reset the database
        call_command("flush", interactive=False)
        call_command("migrate", interactive=False)

        fake = Faker()
        for _ in range(100):
            TestPlan.objects.create(
                name=fake.catch_phrase(),
                description=fake.paragraph(),
                status=fake.random_element(TEST_PLAN_STATUS)[0],
            )
        self.stdout.write(self.style.SUCCESS("Seed data created successfully."))
