from django.apps import AppConfig


class InvoicesConfig(AppConfig):
    name = "invoices"
    # Type checker workaround for default_auto_field
    default_auto_field = "django.db.models.BigAutoField"
