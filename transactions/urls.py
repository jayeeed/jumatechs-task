from django.urls import path
from . import views

urlpatterns = [
    path("", views.TransactionListView.as_view(), name="transaction-list"),
    path("<int:pk>/", views.TransactionDetailView.as_view(), name="transaction-detail"),
]
