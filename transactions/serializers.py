from rest_framework import serializers
from .models import Transaction


class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = [
            "id",
            "invoice",
            "transaction_type",
            "amount",
            "transaction_date",
            "status",
            "created_by",
        ]
        read_only_fields = ["transaction_date"]
