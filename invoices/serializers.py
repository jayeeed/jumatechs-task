from rest_framework import serializers
from .models import Invoice, InvoiceItem


class InvoiceItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = InvoiceItem
        fields = ["id", "description", "quantity", "unit_price", "total_price"]
        read_only_fields = ["total_price"]


class InvoiceSerializer(serializers.ModelSerializer):
    items = InvoiceItemSerializer(many=True)

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

    def create(self, validated_data):
        items_data = validated_data.pop("items", [])
        invoice = Invoice(**validated_data)
        invoice.save()

        for item_data in items_data:
            item = InvoiceItem(invoice=invoice, **item_data)
            item.save()

        # Calculate total amount
        invoice.calculate_total()

        return invoice

    def update(self, instance, validated_data):
        items_data = validated_data.pop("items", [])

        # Update invoice fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # Clear existing items and create new ones
        if items_data:
            instance.items.all().delete()
            for item_data in items_data:
                item = InvoiceItem(invoice=instance, **item_data)
                item.save()

            # Recalculate total amount
            instance.calculate_total()

        return instance
