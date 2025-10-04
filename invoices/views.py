from django.shortcuts import render
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
        return Invoice.objects.all()

    def perform_create(self, serializer):
        invoice = serializer.save(created_by=self.request.user)
        # Auto-calculate total amount from items
        items_data = self.request.data.get("items", [])
        if items_data:
            # Create invoice items
            for item_data in items_data:
                # Ensure proper types for quantity and unit_price
                item_data["quantity"] = int(item_data.get("quantity", 0))
                item_data["unit_price"] = Decimal(str(item_data.get("unit_price", 0)))
                InvoiceItem.objects.create(invoice=invoice, **item_data)

            # Calculate total amount using the model method
            invoice.calculate_total()

            # Create sale transaction
            Transaction.objects.create(
                invoice=invoice,
                transaction_type="sale",
                amount=invoice.total_amount,
                created_by=self.request.user,
            )


class InvoiceDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = InvoiceSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Invoice.objects.all()


@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def mark_invoice_paid(request, pk):
    try:
        invoice = Invoice.objects.get(pk=pk)

        # Validate invoice status before payment
        if invoice.status != "pending":
            return Response(
                {"error": "Only pending invoices can be marked as paid"},
                status=status.HTTP_400_BAD_REQUEST,
            )

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
    except Invoice.DoesNotExist:
        return Response(
            {"error": "Invoice not found"}, status=status.HTTP_404_NOT_FOUND
        )
    except (ValueError, TypeError) as e:
        return Response(
            {"error": "Invalid data type in request"},
            status=status.HTTP_400_BAD_REQUEST,
        )
