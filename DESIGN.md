# System Design Document

## Overview
This document outlines the system design for a backend system that manages sales invoices and records related transactions using Django and Django REST Framework, with an optional ReactJS frontend.

## Requirements

### Backend Requirements (Django + DRF)
- Use Django and Django REST Framework
- Implement token-based authentication (JWT)
- Only authenticated users should access invoice APIs

### Core Features
1. **Invoice Creation**
   - Create new invoices with customer details and invoice items
   - Auto-calculate total amount from items
   - Validate that each invoice has at least one item
   - Ensure each invoice has a unique reference/number
   - Record a Sale transaction when an invoice is created

2. **Invoice Listing & Retrieval**
   - List all invoices
   - View details of a single invoice

3. **Invoice Payment**
   - Mark invoices as paid
   - Only allow payment if invoice is in Pending status
   - Record a Payment transaction when an invoice is paid
   - Update payment status correctly

4. **Transactions**
   - Record Sale transaction when invoice is created
   - Record Payment transaction when invoice is paid

### Business Logic
- Total amount should be auto-calculated from items
- Invoice must have at least one item
- Payment should only be allowed if the invoice is in Pending status
- Totals should always match with items

### Validation Rules
- Each invoice must have unique reference/number
- Totals cannot be negative
- Payment status must update correctly

### Frontend Requirements (ReactJS with TypeScript)
- Create invoice form
- List invoices in a table
- View invoice details
- Button to mark invoice as paid

## System Architecture

```mermaid
graph TD
    A[Client Applications] --> B[API Gateway]
    B --> C[Django REST Framework API]
    C --> D[(PostgreSQL Database)]
    
    subgraph Backend
        C --> E[Authentication Module]
        C --> F[Invoice Management Module]
        C --> G[Transaction Module]
        
        E --> H[JWT Token Validation]
        F --> I[Invoice CRUD Operations]
        F --> J[Invoice Validation]
        G --> K[Transaction Logging]
    end
    
    subgraph Frontend
        L[ReactJS Application]
        L --> M[Invoice Creation Form]
        L --> N[Invoice List View]
        L --> O[Invoice Detail View]
        L --> P[Payment Button]
    end
    
    L -- API Calls --> B
```

## Database Design

```mermaid
erDiagram
    USER ||--o{ INVOICE : creates
    INVOICE ||--o{ INVOICE_ITEM : contains
    INVOICE ||--o{ TRANSACTION : generates
    
    USER {
        int id PK
        string username
        string email
        string password
    }
    
    INVOICE {
        int id PK
        string reference_number UK
        int customer_id FK
        string customer_name
        string customer_email
        decimal total_amount
        string status
        datetime created_at
        datetime updated_at
    }
    
    INVOICE_ITEM {
        int id PK
        int invoice_id FK
        string description
        int quantity
        decimal unit_price
        decimal total_price
    }
    
    TRANSACTION {
        int id PK
        int invoice_id FK
        string transaction_type
        decimal amount
        datetime transaction_date
        string status
    }
```

## API Endpoints

### Authentication
- POST `/api/auth/login/` - User login
- POST `/api/auth/logout/` - User logout

### Invoices
- GET `/api/invoices/` - List all invoices
- POST `/api/invoices/` - Create new invoice
- GET `/api/invoices/{id}/` - Retrieve invoice details
- PUT `/api/invoices/{id}/` - Update invoice
- PATCH `/api/invoices/{id}/mark-paid/` - Mark invoice as paid

### Transactions
- GET `/api/transactions/` - List all transactions
- GET `/api/transactions/{id}/` - Retrieve transaction details

## Data Flow

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant API
    participant Database
    
    User->>Frontend: Access application
    Frontend->>API: Request authentication
    API->>Database: Validate credentials
    Database-->>API: Return user data
    API-->>Frontend: Return JWT token
    
    User->>Frontend: Create invoice
    Frontend->>API: POST /invoices/ with data
    API->>API: Validate invoice data
    API->>Database: Save invoice
    Database->>Database: Auto-create Sale transaction
    Database-->>API: Return saved invoice
    API-->>Frontend: Return invoice with ID
    
    User->>Frontend: Mark invoice as paid
    Frontend->>API: PATCH /invoices/{id}/mark-paid/
    API->>API: Validate invoice status
    API->>Database: Update invoice status
    Database->>Database: Create Payment transaction
    Database-->>API: Return updated invoice
    API-->>Frontend: Return updated invoice
```

## Implementation Plan

1. Set up Django project with DRF
2. Implement authentication system with JWT
3. Create Invoice and related models
4. Develop Invoice CRUD API endpoints
5. Implement transaction recording logic
6. Add validation and business logic
7. Create database migrations
8. Write API documentation
9. Develop minimal test coverage
10. (Optional) Build ReactJS frontend
11. Prepare deployment and documentation