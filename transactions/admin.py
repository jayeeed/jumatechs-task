from django.contrib import admin
from .models import Transaction


@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = (
        "invoice",
        "transaction_type",
        "amount",
        "transaction_date",
        "status",
    )
    list_filter = ("transaction_type", "status", "transaction_date")
    search_fields = ("invoice__reference_number",)
    readonly_fields = ("transaction_date",)
