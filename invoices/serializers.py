from rest_framework import serializers
from .models import Invoice, InvoiceItem


class InvoiceItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = InvoiceItem
        fields = ["id", "description", "quantity", "unit_price", "total_price"]
        read_only_fields = ["total_price"]


class InvoiceSerializer(serializers.ModelSerializer):
    items = InvoiceItemSerializer(many=True, read_only=True)

    class Meta:
        model = Invoice
        fields = [
            "id",
            "reference_number",
            "customer_name",
            "customer_email",
            "total_amount",
            "status",
            "created_at",
            "updated_at",
            "items",
        ]
        read_only_fields = ["created_at", "updated_at", "total_amount"]
