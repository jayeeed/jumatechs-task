from django.db import models
from django.contrib.auth.models import User


class Invoice(models.Model):
    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("paid", "Paid"),
        ("cancelled", "Cancelled"),
    ]

    reference_number = models.CharField(max_length=50, unique=True)
    customer_name = models.CharField(max_length=100)
    customer_email = models.EmailField()
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.reference_number} - {self.customer_name}"

    def calculate_total(self):
        """Calculate the total amount from invoice items"""
        total = sum(item.total_price for item in self.items.all())
        self.total_amount = total
        self.save()
        return total

    class Meta:
        ordering = ["-created_at"]


class InvoiceItem(models.Model):
    invoice = models.ForeignKey(Invoice, related_name="items", on_delete=models.CASCADE)
    description = models.CharField(max_length=200)
    quantity = models.PositiveIntegerField()
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    total_price = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.description} - {self.invoice.reference_number}"

    def save(self, *args, **kwargs):
        self.total_price = self.quantity * self.unit_price
        super().save(*args, **kwargs)
