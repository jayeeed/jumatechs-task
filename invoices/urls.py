from django.urls import path
from . import views

urlpatterns = [
    path("", views.InvoiceListCreateView.as_view(), name="invoice-list-create"),
    path("<int:pk>/", views.InvoiceDetailView.as_view(), name="invoice-detail"),
    path("<int:pk>/mark-paid/", views.mark_invoice_paid, name="invoice-mark-paid"),
]
