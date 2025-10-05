from django.shortcuts import render, get_object_or_404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.authentication import SessionAuthentication, BasicAuthentication
from rest_framework import status, generics
from rest_framework.decorators import api_view, permission_classes
from decimal import Decimal
from .models import Invoice, InvoiceItem
from .serializers import InvoiceSerializer, InvoiceItemSerializer
from transactions.models import Transaction


class InvoiceListCreateView(generics.ListCreateAPIView):
    serializer_class = InvoiceSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Return only invoices created by the current user
        return Invoice.objects.filter(created_by=self.request.user)

    def perform_create(self, serializer):
        # Save the invoice first
        invoice = serializer.save(created_by=self.request.user)

        # Process items if provided
        items_data = self.request.data.get("items", [])
        if items_data:
            created_items = []
            # Create invoice items
            for item_data in items_data:
                # Ensure proper types for quantity and unit_price
                item_data["quantity"] = int(item_data.get("quantity", 0))
                item_data["unit_price"] = Decimal(str(item_data.get("unit_price", 0)))
                # Create the item and keep track of it
                item = InvoiceItem.objects.create(invoice=invoice, **item_data)
                created_items.append(item)

            # Calculate total amount using the model method
            total = invoice.calculate_total()

            # Create sale transaction with the calculated total
            Transaction.objects.create(
                invoice=invoice,
                transaction_type="sale",
                amount=total,
                created_by=self.request.user,
            )


class InvoiceDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = InvoiceSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Return only invoices created by the current user
        return Invoice.objects.filter(created_by=self.request.user)

    def perform_update(self, serializer):
        """Allow updating invoices at any time, regardless of status"""
        invoice = serializer.save()
        # Recalculate total if items data is provided
        items_data = self.request.data.get("items", [])
        if items_data:
            # Clear existing items
            invoice.items.all().delete()
            # Create new items
            for item_data in items_data:
                item_data["quantity"] = int(item_data.get("quantity", 0))
                item_data["unit_price"] = Decimal(str(item_data.get("unit_price", 0)))
                InvoiceItem.objects.create(invoice=invoice, **item_data)

            # Recalculate total amount
            invoice.calculate_total()


@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def mark_invoice_paid(request, pk):
    try:
        invoice = get_object_or_404(Invoice, pk=pk, created_by=request.user)

        # Update invoice status
        invoice.status = "paid"
        invoice.save()

        # Create payment transaction
        Transaction.objects.create(
            invoice=invoice,
            transaction_type="payment",
            amount=invoice.total_amount,
            created_by=request.user,
        )

        serializer = InvoiceSerializer(invoice)
        return Response(serializer.data)
    except (ValueError, TypeError) as e:
        return Response(
            {"error": "Invalid data type in request"},
            status=status.HTTP_400_BAD_REQUEST,
        )


@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def mark_invoice_pending(request, pk):
    try:
        invoice = get_object_or_404(Invoice, pk=pk, created_by=request.user)

        # Update invoice status to pending
        invoice.status = "pending"
        invoice.save()

        serializer = InvoiceSerializer(invoice)
        return Response(serializer.data)
    except (ValueError, TypeError) as e:
        return Response(
            {"error": "Invalid data type in request"},
            status=status.HTTP_400_BAD_REQUEST,
        )
