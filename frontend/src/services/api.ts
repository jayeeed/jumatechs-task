import { Invoice, Transaction, CreateInvoiceRequest } from "@/types/invoice";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

// Helper to get auth token
const getAuthHeaders = () => {
  const tokens = localStorage.getItem("authTokens");
  if (!tokens) {
    throw new Error("Not authenticated");
  }
  const { access } = JSON.parse(tokens);
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${access}`,
  };
};

// API Service - Django backend integration
export const invoiceApi = {
  // GET /api/invoices/
  async getInvoices(): Promise<Invoice[]> {
    const response = await fetch(`${API_BASE_URL}/api/invoices/`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch invoices");
    }

    return response.json();
  },

  // GET /api/invoices/:id/
  async getInvoice(id: number): Promise<Invoice> {
    const response = await fetch(`${API_BASE_URL}/api/invoices/${id}/`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch invoice");
    }

    return response.json();
  },

  // POST /api/invoices/
  async createInvoice(data: CreateInvoiceRequest): Promise<Invoice> {
    const response = await fetch(`${API_BASE_URL}/api/invoices/`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to create invoice");
    }

    return response.json();
  },

  // PUT /api/invoices/:id/
  async updateInvoice(id: number, data: CreateInvoiceRequest): Promise<Invoice> {
    const response = await fetch(`${API_BASE_URL}/api/invoices/${id}/`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to update invoice");
    }

    return response.json();
  },

  // DELETE /api/invoices/:id/
  async deleteInvoice(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/invoices/${id}/`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Failed to delete invoice");
    }
  },

  // PATCH /api/invoices/:id/mark-paid/
  async payInvoice(id: number): Promise<Invoice> {
    const response = await fetch(`${API_BASE_URL}/api/invoices/${id}/mark-paid/`, {
      method: "PATCH",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to mark invoice as paid");
    }

    return response.json();
  },

  // PATCH /api/invoices/:id/mark-pending/
  async markPending(id: number): Promise<Invoice> {
    const response = await fetch(`${API_BASE_URL}/api/invoices/${id}/mark-pending/`, {
      method: "PATCH",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to mark invoice as pending");
    }

    return response.json();
  },

  // GET /api/transactions/
  async getAllTransactions(): Promise<Transaction[]> {
    const response = await fetch(`${API_BASE_URL}/api/transactions/`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch transactions");
    }

    return response.json();
  },

  // GET /api/transactions/:id/
  async getTransaction(id: number): Promise<Transaction> {
    const response = await fetch(`${API_BASE_URL}/api/transactions/${id}/`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch transaction");
    }

    return response.json();
  },
};