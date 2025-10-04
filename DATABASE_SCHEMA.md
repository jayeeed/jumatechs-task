# Database Schema

## Overview
This document describes the database schema for the Invoice Management System.

## Tables

### 1. Users (Django Built-in)
The system uses Django's built-in User model for authentication.

### 2. Invoices
Stores invoice information.

**Fields:**
- `id` (AutoField) - Primary key
- `reference_number` (CharField) - Unique invoice reference number
- `customer_name` (CharField) - Customer name
- `customer_email` (EmailField) - Customer email address
- `total_amount` (DecimalField) - Total invoice amount
- `status` (CharField) - Invoice status (pending, paid, cancelled)
- `created_at` (DateTimeField) - Timestamp when invoice was created
- `updated_at` (DateTimeField) - Timestamp when invoice was last updated
- `created_by` (ForeignKey) - Reference to User who created the invoice

### 3. Invoice Items
Stores individual items within an invoice.

**Fields:**
- `id` (AutoField) - Primary key
- `invoice` (ForeignKey) - Reference to the parent Invoice
- `description` (CharField) - Item description
- `quantity` (PositiveIntegerField) - Quantity of items
- `unit_price` (DecimalField) - Price per unit
- `total_price` (DecimalField) - Total price for this item (quantity × unit_price)

### 4. Transactions
Stores transaction records related to invoices.

**Fields:**
- `id` (AutoField) - Primary key
- `invoice` (ForeignKey) - Reference to the related Invoice
- `transaction_type` (CharField) - Type of transaction (sale, payment)
- `amount` (DecimalField) - Transaction amount
- `transaction_date` (DateTimeField) - Timestamp when transaction occurred
- `status` (CharField) - Transaction status
- `created_by` (ForeignKey) - Reference to User who created the transaction

## Relationships

1. **User → Invoice** (One-to-Many)
   - One user can create many invoices
   - `Invoice.created_by` references `User.id`

2. **Invoice → InvoiceItem** (One-to-Many)
   - One invoice can have many items
   - `InvoiceItem.invoice` references `Invoice.id`

3. **Invoice → Transaction** (One-to-Many)
   - One invoice can have many transactions
   - `Transaction.invoice` references `Invoice.id`

4. **User → Transaction** (One-to-Many)
   - One user can create many transactions
   - `Transaction.created_by` references `User.id`

## Constraints

1. `reference_number` in Invoice table is unique
2. `total_price` in InvoiceItem is automatically calculated as `quantity × unit_price`
3. All foreign key relationships are enforced by the database
4. `created_at` and `updated_at` in Invoice are automatically managed
5. `transaction_date` in Transaction is automatically set on creation

## Indexes

1. Invoice table is indexed by `created_at` (descending) for performance
2. Transaction table is indexed by `transaction_date` (descending) for performance
3. All foreign key fields are automatically indexed by Django
