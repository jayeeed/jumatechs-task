from django.test import TestCase
from django.contrib.auth.models import User
from .models import Transaction
from invoices.models import Invoice


class TransactionModelTest(TestCase):
    def setUp(self):
        # Create test user
        self.user = User.objects.create_user(
            username="testuser", password="testpass123"
        )

        # Create test invoice
        self.invoice = Invoice.objects.create(
            reference_number="INV-001",
            customer_name="Test Customer",
            customer_email="customer@test.com",
            total_amount=100.00,
            created_by=self.user,
        )

    def test_transaction_creation(self):
        """Test basic transaction creation"""
        # Create a transaction
        transaction = Transaction.objects.create(
            invoice=self.invoice,
            transaction_type="sale",
            amount=100.00,
            created_by=self.user,
        )

        # Verify the transaction was created
        self.assertEqual(Transaction.objects.count(), 1)
        self.assertEqual(transaction.invoice, self.invoice)
        self.assertEqual(transaction.transaction_type, "sale")
        self.assertEqual(float(transaction.amount), 100.00)
        self.assertEqual(transaction.created_by, self.user)
