from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status
from .models import Invoice, InvoiceItem
from transactions.models import Transaction


class InvoiceAPITestCase(TestCase):
    def setUp(self):
        # Create test user
        self.user = User.objects.create_user(
            username="testuser", password="testpass123"
        )

        # Create API client and authenticate
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

    def test_basic_invoice_creation(self):
        """Test basic invoice creation"""
        # Create a simple invoice directly
        invoice = Invoice.objects.create(
            reference_number="INV-001",
            customer_name="Test Customer",
            customer_email="customer@test.com",
            total_amount=100.00,
            created_by=self.user,
        )

        # Verify the invoice was created
        self.assertEqual(Invoice.objects.count(), 1)
        self.assertEqual(invoice.reference_number, "INV-001")
        self.assertEqual(invoice.customer_name, "Test Customer")

        # Create an invoice item
        item = InvoiceItem.objects.create(
            invoice=invoice, description="Test Item", quantity=2, unit_price=50.00
        )

        # Verify the item was created
        self.assertEqual(InvoiceItem.objects.count(), 1)
        self.assertEqual(item.invoice, invoice)
        # Compare as floats to avoid precision issues
        self.assertEqual(float(item.total_price), 100.0)

    def test_invoice_payment_flow(self):
        """Test the complete invoice payment flow"""
        # Create an invoice
        invoice = Invoice.objects.create(
            reference_number="INV-002",
            customer_name="Test Customer",
            customer_email="customer@test.com",
            total_amount=200.00,
            status="pending",
            created_by=self.user,
        )

        # Verify initial status
        self.assertEqual(invoice.status, "pending")

        # Create a sale transaction
        sale_transaction = Transaction.objects.create(
            invoice=invoice,
            transaction_type="sale",
            amount=200.00,
            created_by=self.user,
        )

        # Verify sale transaction
        self.assertEqual(Transaction.objects.count(), 1)
        self.assertEqual(sale_transaction.transaction_type, "sale")

        # Change invoice status to paid
        invoice.status = "paid"
        invoice.save()

        # Verify status change
        invoice.refresh_from_db()
        self.assertEqual(invoice.status, "paid")

        # Create a payment transaction
        payment_transaction = Transaction.objects.create(
            invoice=invoice,
            transaction_type="payment",
            amount=200.00,
            created_by=self.user,
        )

        # Verify payment transaction
        self.assertEqual(Transaction.objects.count(), 2)
        self.assertEqual(payment_transaction.transaction_type, "payment")

        # Verify both transactions are for the same invoice
        transactions = Transaction.objects.filter(invoice=invoice)
        self.assertEqual(transactions.count(), 2)
        transaction_types = [t.transaction_type for t in transactions]
        self.assertIn("sale", transaction_types)
        self.assertIn("payment", transaction_types)
