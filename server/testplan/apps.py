from django.apps import AppConfig


class TestplanConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "testplan"

    def ready(self):
        import testplan.signals  # noqa: F401
