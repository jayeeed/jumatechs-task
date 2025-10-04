We need a backend system that can manage sales invoices and record related transactions. The system should allow users to create, update, view, and manage invoices. Additionally, it should keep track of basic transaction records whenever an invoice is created or paid.

Backend Requirements (Django + DRF)
Use Django and Django REST Framework.
Core Features:
Invoice Creation:  create new invoices with customer details and invoice items.
Invoice Listing & Retrieval: List invoices and view details of a single invoice.
Invoice Payment: Mark invoices as paid and record a related transaction.
Transactions: When an invoice is created, record a Sale transaction. When an invoice is paid, record a Payment transaction.

Business Logic:
Total amount should be auto-calculated from items.
Invoice must have at least one item.
Payment should only be allowed if the invoice is in Pending status.
Totals should always match with items.

Validation:
Each invoice must have unique reference/number.
Totals cannot be negative.
Payment status must update correctly.

Authentication: Add basic token authentication. Only authenticated users should access invoice APIs. (JWT)

Frontend (ReactJS using ts)
A simple UI is optional but will be considered a plus.
Functions:
Create invoice form
List invoices in a table
View invoice details
Button to mark invoice as paid

Deliverables
Django project with working APIs (Invoices + Transactions).
Database migrations and seed data if needed.
API documentation (Swagger/OpenAPI or DRF built-in).
Minimal test coverage for invoice creation and payment.
(Optional) A lightweight frontend demo.

Submission
Upload the project code to GitHub with a proper commit history.
Document API usage clearly in README and Swagger.
A short live demo render.
Share the GitHub link and demo video once complete.
