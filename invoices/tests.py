"""
Tests for the invoices app.
These tests will run on a test database which is automatically created and destroyed.
"""

from django.test import TestCase
from django.contrib.auth.models import User
from django.db import IntegrityError
from invoices.models import Invoice, InvoiceItem
from transactions.models import Transaction


class SimpleInvoiceTest(TestCase):
    """Simple test cases for invoice and transaction functionality"""

    def setUp(self):
        """Set up test data"""
        self.user = User.objects.create_user(
            username="testuser", email="test@example.com", password="testpass123"
        )

    def test_create_invoice_and_mark_paid(self):
        """Test creating an invoice and marking it as paid"""
        # Create an invoice
        invoice = Invoice.objects.create(
            reference_number="INV-001",
            customer_name="Test Customer",
            customer_email="customer@example.com",
            total_amount=100.00,
            created_by=self.user,
        )

        # Verify invoice was created correctly
        self.assertEqual(invoice.reference_number, "INV-001")
        self.assertEqual(invoice.customer_name, "Test Customer")
        self.assertEqual(invoice.status, "pending")
        self.assertEqual(invoice.created_by, self.user)

        # Create an invoice item
        invoice_item = InvoiceItem.objects.create(
            invoice=invoice,
            description="Test Item",
            quantity=2,
            unit_price=50.00,
            total_price=100.00,
        )

        # Verify invoice item was created
        self.assertEqual(invoice.items.count(), 1)
        self.assertEqual(invoice_item.description, "Test Item")

        # Mark invoice as paid
        invoice.status = "paid"
        invoice.save()

        # Refresh from database
        invoice.refresh_from_db()

        # Check that the status is updated
        self.assertEqual(invoice.status, "paid")

        # Create a payment transaction
        payment_transaction = Transaction.objects.create(
            invoice=invoice,
            transaction_type="payment",
            amount=invoice.total_amount,
            created_by=self.user,
        )

        # Check that a payment transaction was created
        transactions = Transaction.objects.filter(
            invoice=invoice, transaction_type="payment"
        )
        self.assertEqual(transactions.count(), 1)
        self.assertEqual(transactions.first().amount, 100.00)

        # Also check that a sale transaction exists (created when invoice was created in a real scenario)
        sale_transactions = Transaction.objects.filter(
            invoice=invoice, transaction_type="sale"
        )
        # In this test, we didn't create a sale transaction, so it should be 0
        self.assertEqual(sale_transactions.count(), 0)

    def test_mark_paid_invoice_as_paid_again(self):
        """Test attempting to mark an already paid invoice as paid"""
        # Create an invoice and mark it as paid
        invoice = Invoice.objects.create(
            reference_number="INV-003",
            customer_name="Test Customer",
            customer_email="customer@example.com",
            total_amount=100.00,
            created_by=self.user,
            status="paid",  # Already paid
        )

        # Verify it's already paid
        self.assertEqual(invoice.status, "paid")

        # In a real scenario, this would be prevented by business logic
        # But in our direct model test, we can change it
        invoice.status = "paid"
        invoice.save()
        invoice.refresh_from_db()

        # Should still be paid
        self.assertEqual(invoice.status, "paid")

    def test_mark_cancelled_invoice_as_paid(self):
        """Test attempting to mark a cancelled invoice as paid"""
        # Create a cancelled invoice
        invoice = Invoice.objects.create(
            reference_number="INV-004",
            customer_name="Test Customer",
            customer_email="customer@example.com",
            total_amount=100.00,
            created_by=self.user,
            status="cancelled",
        )

        # Verify it's cancelled
        self.assertEqual(invoice.status, "cancelled")

        # Mark as paid (should be allowed at model level, but might be prevented by business logic)
        invoice.status = "paid"
        invoice.save()
        invoice.refresh_from_db()

        # Should now be paid
        self.assertEqual(invoice.status, "paid")

    def test_unique_reference_number_constraint(self):
        """Test that reference numbers must be unique"""
        # Create first invoice
        Invoice.objects.create(
            reference_number="INV-005",
            customer_name="Test Customer",
            customer_email="customer@example.com",
            total_amount=100.00,
            created_by=self.user,
        )

        # Try to create second invoice with same reference number
        with self.assertRaises(IntegrityError):
            Invoice.objects.create(
                reference_number="INV-005",  # Duplicate reference
                customer_name="Another Customer",
                customer_email="another@example.com",
                total_amount=200.00,
                created_by=self.user,
            )

    def test_invoice_item_calculation(self):
        """Test that invoice items calculate total price correctly"""
        # Create an invoice
        invoice = Invoice.objects.create(
            reference_number="INV-006",
            customer_name="Test Customer",
            customer_email="customer@example.com",
            total_amount=0.00,
            created_by=self.user,
        )

        # Create invoice items
        item1 = InvoiceItem.objects.create(
            invoice=invoice,
            description="Item 1",
            quantity=2,
            unit_price=50.00,
            # total_price should be calculated as 100.00
        )

        # Check that total price was calculated correctly
        self.assertEqual(item1.total_price, 100.00)

        item2 = InvoiceItem.objects.create(
            invoice=invoice,
            description="Item 2",
            quantity=3,
            unit_price=25.00,
            # total_price should be calculated as 75.00
        )

        # Check that total price was calculated correctly
        self.assertEqual(item2.total_price, 75.00)

        # Check invoice total calculation
        invoice.calculate_total()
        invoice.refresh_from_db()
        self.assertEqual(invoice.total_amount, 175.00)

    def test_transaction_with_zero_amount(self):
        """Test creating a transaction with zero amount"""
        # Create an invoice
        invoice = Invoice.objects.create(
            reference_number="INV-007",
            customer_name="Test Customer",
            customer_email="customer@example.com",
            total_amount=100.00,
            created_by=self.user,
        )

        # Create a transaction with zero amount
        transaction = Transaction.objects.create(
            invoice=invoice,
            transaction_type="payment",
            amount=0.00,  # Zero amount
            created_by=self.user,
        )

        # Verify transaction was created correctly
        self.assertEqual(transaction.amount, 0.00)
        self.assertEqual(transaction.transaction_type, "payment")

    def test_multiple_payments_on_same_invoice(self):
        """Test creating multiple payment transactions on the same invoice"""
        # Create an invoice
        invoice = Invoice.objects.create(
            reference_number="INV-008",
            customer_name="Test Customer",
            customer_email="customer@example.com",
            total_amount=100.00,
            created_by=self.user,
        )

        # Create multiple payment transactions
        transaction1 = Transaction.objects.create(
            invoice=invoice,
            transaction_type="payment",
            amount=50.00,
            created_by=self.user,
        )

        transaction2 = Transaction.objects.create(
            invoice=invoice,
            transaction_type="payment",
            amount=50.00,
            created_by=self.user,
        )

        # Check that both transactions were created
        transactions = Transaction.objects.filter(
            invoice=invoice, transaction_type="payment"
        )
        self.assertEqual(transactions.count(), 2)
        self.assertEqual(sum(t.amount for t in transactions), 100.00)

    def test_invoice_item_save_calculation(self):
        """Test that invoice item save method calculates total price"""
        # Create an invoice
        invoice = Invoice.objects.create(
            reference_number="INV-009",
            customer_name="Test Customer",
            customer_email="customer@example.com",
            total_amount=0.00,
            created_by=self.user,
        )

        # Create an invoice item without specifying total_price
        item = InvoiceItem(
            invoice=invoice,
            description="Test Item",
            quantity=3,
            unit_price=25.00,
            # total_price should be calculated automatically
        )
        item.save()

        # Check that total price was calculated correctly
        self.assertEqual(item.total_price, 75.00)

        # Refresh from database and check again
        item.refresh_from_db()
        self.assertEqual(item.total_price, 75.00)
