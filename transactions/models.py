from django.db import models
from django.contrib.auth.models import User
from invoices.models import Invoice


class Transaction(models.Model):
    TRANSACTION_TYPES = [
        ("sale", "Sale"),
        ("payment", "Payment"),
    ]

    invoice = models.ForeignKey(Invoice, on_delete=models.CASCADE)
    transaction_type = models.CharField(max_length=20, choices=TRANSACTION_TYPES)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    transaction_date = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, default="completed")
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.transaction_type} Transaction"

    class Meta:
        ordering = ["-transaction_date"]
