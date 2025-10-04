"""
Tests for the transactions app.
These tests will run on a test database which is automatically created and destroyed.
"""

from django.test import TestCase
from django.contrib.auth.models import User
from django.db import IntegrityError
from django.utils import timezone as django_timezone
from invoices.models import Invoice
from transactions.models import Transaction


class TransactionModelTest(TestCase):
    """Test cases for Transaction model functionality"""

    def setUp(self):
        """Set up test data"""
        self.user = User.objects.create_user(
            username="testuser", email="test@example.com", password="testpass123"
        )

        self.invoice = Invoice.objects.create(
            reference_number="INV-001",
            customer_name="Test Customer",
            customer_email="customer@example.com",
            total_amount=100.00,
            created_by=self.user,
        )

        self.transaction = Transaction.objects.create(
            invoice=self.invoice,
            transaction_type="sale",
            amount=100.00,
            created_by=self.user,
        )

    def test_create_transaction(self):
        """Test creating a transaction"""
        transaction = Transaction.objects.create(
            invoice=self.invoice,
            transaction_type="payment",
            amount=50.00,
            created_by=self.user,
        )

        # Verify transaction was created correctly
        self.assertEqual(transaction.invoice, self.invoice)
        self.assertEqual(transaction.transaction_type, "payment")
        self.assertEqual(transaction.amount, 50.00)
        self.assertEqual(transaction.created_by, self.user)
        self.assertEqual(transaction.status, "completed")

    def test_transaction_str_representation(self):
        """Test the string representation of a transaction"""
        self.assertEqual(str(self.transaction), "sale Transaction")

    def test_create_transaction_with_zero_amount(self):
        """Test creating a transaction with zero amount"""
        transaction = Transaction.objects.create(
            invoice=self.invoice,
            transaction_type="payment",
            amount=0.00,  # Zero amount
            created_by=self.user,
        )

        # Verify transaction was created correctly
        self.assertEqual(transaction.amount, 0.00)
        self.assertEqual(transaction.transaction_type, "payment")
        self.assertEqual(transaction.status, "completed")

    def test_create_transaction_with_negative_amount(self):
        """Test creating a transaction with negative amount"""
        # First, we need to check if the model allows negative amounts
        transaction = Transaction.objects.create(
            invoice=self.invoice,
            transaction_type="payment",
            amount=-50.00,  # Negative amount
            created_by=self.user,
        )

        # Verify transaction was created correctly
        self.assertEqual(transaction.amount, -50.00)
        self.assertEqual(transaction.transaction_type, "payment")

    def test_create_multiple_transactions_same_invoice(self):
        """Test creating multiple transactions for the same invoice"""
        # Create multiple transactions
        transaction1 = Transaction.objects.create(
            invoice=self.invoice,
            transaction_type="payment",
            amount=30.00,
            created_by=self.user,
        )

        transaction2 = Transaction.objects.create(
            invoice=self.invoice,
            transaction_type="payment",
            amount=70.00,
            created_by=self.user,
        )

        # Verify both transactions were created
        transactions = Transaction.objects.filter(invoice=self.invoice)
        self.assertEqual(transactions.count(), 3)  # 2 new + 1 from setUp

        # Verify amounts
        payment_transactions = Transaction.objects.filter(
            invoice=self.invoice, transaction_type="payment"
        )
        self.assertEqual(payment_transactions.count(), 2)
        self.assertEqual(sum(t.amount for t in payment_transactions), 100.00)

    def test_transaction_types(self):
        """Test different transaction types"""
        # Test sale transaction
        sale_transaction = Transaction.objects.create(
            invoice=self.invoice,
            transaction_type="sale",
            amount=100.00,
            created_by=self.user,
        )
        self.assertEqual(sale_transaction.transaction_type, "sale")

        # Test payment transaction
        payment_transaction = Transaction.objects.create(
            invoice=self.invoice,
            transaction_type="payment",
            amount=100.00,
            created_by=self.user,
        )
        self.assertEqual(payment_transaction.transaction_type, "payment")

    def test_transaction_amount_precision(self):
        """Test transaction amount precision with decimal values"""
        transaction = Transaction.objects.create(
            invoice=self.invoice,
            transaction_type="payment",
            amount=99.99,  # Precise decimal amount
            created_by=self.user,
        )

        # Verify precision is maintained
        self.assertEqual(transaction.amount, 99.99)

    def test_transaction_default_status(self):
        """Test that transactions get default status"""
        transaction = Transaction.objects.create(
            invoice=self.invoice,
            transaction_type="payment",
            amount=50.00,
            created_by=self.user,
        )

        # Verify default status
        self.assertEqual(transaction.status, "completed")

    def test_transaction_date_auto_set(self):
        """Test that transaction date is automatically set"""
        transaction = Transaction.objects.create(
            invoice=self.invoice,
            transaction_type="payment",
            amount=50.00,
            created_by=self.user,
        )

        # Verify transaction date is set
        self.assertIsNotNone(transaction.transaction_date)

        # Verify it's close to current time
        time_diff = django_timezone.now() - transaction.transaction_date
        self.assertLess(time_diff.total_seconds(), 5)  # Within 5 seconds

    def test_transaction_without_user(self):
        """Test transaction without user (should fail)"""
        with self.assertRaises(Exception):
            Transaction.objects.create(
                invoice=self.invoice,
                transaction_type="payment",
                amount=50.00,
                created_by=None,  # No user
            )

    def test_transaction_without_invoice(self):
        """Test transaction without invoice (should fail)"""
        with self.assertRaises(Exception):
            Transaction.objects.create(
                invoice=None,  # No invoice
                transaction_type="payment",
                amount=50.00,
                created_by=self.user,
            )

    def test_transaction_invalid_type(self):
        """Test transaction with invalid type"""
        # The model should restrict to defined choices, but let's test what happens
        transaction = Transaction(
            invoice=self.invoice,
            transaction_type="invalid_type",  # Invalid type
            amount=50.00,
            created_by=self.user,
        )
        # This might pass at the Python level but fail at DB level
        # depending on database constraints
        transaction.save()
