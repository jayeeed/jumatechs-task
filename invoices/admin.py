from django.contrib import admin
from .models import Invoice, InvoiceItem


@admin.register(Invoice)
class InvoiceAdmin(admin.ModelAdmin):
    list_display = (
        "reference_number",
        "customer_name",
        "total_amount",
        "status",
        "created_at",
    )
    list_filter = ("status", "created_at")
    search_fields = ("reference_number", "customer_name", "customer_email")
    readonly_fields = ("created_at", "updated_at")


@admin.register(InvoiceItem)
class InvoiceItemAdmin(admin.ModelAdmin):
    list_display = ("description", "invoice", "quantity", "unit_price", "total_price")
    list_filter = ("invoice",)
