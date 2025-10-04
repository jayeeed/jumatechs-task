export type InvoiceStatus = "pending" | "paid" | "cancelled";
export type TransactionType = "sale" | "payment";

export interface InvoiceItem {
  id: number;
  description: string;
  quantity: number;
  unit_price: string;
  total_price: string;
}

export interface Transaction {
  id: number;
  transaction_type: TransactionType;
  amount: string;
  transaction_date: string;
  status: string;
}

export interface Invoice {
  id: number;
  reference_number: string;
  customer_name: string;
  customer_email: string;
  total_amount: string;
  status: InvoiceStatus;
  created_at: string;
  updated_at: string;
  items: InvoiceItem[];
  transactions: Transaction[];
}

export interface CreateInvoiceRequest {
  reference_number: string;
  customer_name: string;
  customer_email: string;
  items: {
    description: string;
    quantity: number;
    unit_price: string;
  }[];
}
