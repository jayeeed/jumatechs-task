# Invoice Management System

This is a Django-based backend system for managing sales invoices and recording related transactions.

## Links

- **GitHub Repository**: [https://github.com/jayeeed/jumatechs-task](https://github.com/jayeeed/jumatechs-task)
- **Django Admin**: [https://jumatechs-task.onrender.com/admin/](https://jumatechs-task.onrender.com/admin/)
- **Swagger API Documentation**: [https://jumatechs-task.onrender.com/swagger/](https://jumatechs-task.onrender.com/swagger/)
- **Frontend (React)**: [https://jumatechs-invoice.netlify.app/](https://jumatechs-invoice.netlify.app/)
- **Demo Video**: [https://www.loom.com/share/4e6b2a9081ec405c96f0be4d53602646?sid=27c22da9-515e-4a77-a8ea-d22b402e2d15](https://www.loom.com/share/4e6b2a9081ec405c96f0be4d53602646?sid=27c22da9-515e-4a77-a8ea-d22b402e2d15)

![Video Placeholder](https://placehold.co/600x400?text=Demo+Video+Coming+Soon)

## Features

- User authentication with JWT tokens
- Invoice creation, listing, and management
- Automatic transaction recording for sales and payments
- RESTful API with comprehensive documentation via Swagger

## API Endpoints

### Authentication
- `POST /api/auth/signup/` - User registration
- `POST /api/auth/login/` - User login to obtain JWT tokens
- `POST /api/auth/logout/` - User logout (blacklists refresh token)

### Invoices
- `GET /api/invoices/` - List all invoices
- `POST /api/invoices/` - Create a new invoice
- `GET /api/invoices/{id}/` - Retrieve invoice details
- `PUT /api/invoices/{id}/` - Update invoice
- `PATCH /api/invoices/{id}/mark-paid/` - Mark invoice as paid
- `PATCH /api/invoices/{id}/mark-pending/` - Mark invoice as pending

### Transactions
- `GET /api/transactions/` - List all transactions
- `GET /api/transactions/{id}/` - Retrieve transaction details

## API Usage Instructions

### Authentication Flow

1. **User Registration**
   - Endpoint: `POST /api/auth/signup/`
   - Request Body:
     ```json
     {
       "username": "user123",
       "email": "user@example.com",
       "password": "securepassword",
       "password2": "securepassword",
       "first_name": "John",
       "last_name": "Doe"
     }
     ```

2. **User Login**
   - Endpoint: `POST /api/auth/login/`
   - Request Body:
     ```json
     {
       "username": "user123",
       "password": "securepassword"
     }
     ```
   - Response:
     ```json
     {
       "refresh": "refresh_token_here",
       "access": "access_token_here"
     }
     ```

3. **Using Access Tokens**
   - Access tokens are valid for **5 minutes** (default setting)
   - Include the access token in the Authorization header for all protected endpoints:
     ```
     Authorization: Bearer your_access_token_here
     ```

4. **Refreshing Tokens**
   - When access token expires, use the refresh token to get a new one:
   - Endpoint: `POST /api/auth/token/refresh/`
   - Request Body:
     ```json
     {
       "refresh": "your_refresh_token_here"
     }
     ```

5. **User Logout**
   - Endpoint: `POST /api/auth/logout/`
   - Request Body:
     ```json
     {
       "refresh": "your_refresh_token_here"
     }
     ```

### Creating an Invoice

- Endpoint: `POST /api/invoices/`
- Headers: `Authorization: Bearer your_access_token_here`
- Request Body:
  ```json
  {
    "reference_number": "INV-001",
    "customer_name": "Acme Corp",
    "customer_email": "contact@acme.com",
    "items": [
      {
        "description": "Product A",
        "quantity": 2,
        "unit_price": "150.00"
      },
      {
        "description": "Product B",
        "quantity": 1,
        "unit_price": "75.00"
      }
    ]
  }
  ```

### Marking an Invoice as Paid

- Endpoint: `PATCH /api/invoices/{id}/mark-paid/`
- Headers: `Authorization: Bearer your_access_token_here`

### Marking an Invoice as Pending

- Endpoint: `PATCH /api/invoices/{id}/mark-pending/`
- Headers: `Authorization: Bearer your_access_token_here`

## API Documentation

Interactive API documentation is available via Swagger UI:
- `http://localhost:8000/swagger/` - Swagger UI
- `http://localhost:8000/redoc/` - ReDoc documentation

For detailed API usage instructions, see [API_DOCUMENTATION.md](API_DOCUMENTATION.md).

For detailed database schema information, see [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md).

## Installation

1. Install dependencies:
   ```
   python3 -m venv .venv && source .venv/bin/activate && pip install -r requirements.txt
   ```

2. Set up environment variables in a `.env` file:
   ```
   DB_NAME=your_database_name
   DB_USER=your_database_user
   DB_PASSWORD=your_database_password
   DB_HOST=your_database_host
   DB_PORT=your_database_port
   ```

3. Run migrations:
   ```
   python3 manage.py migrate
   ```

4. Create a superuser:
   ```
   python3 manage.py createsuperuser
   ```

5. Run the development server:
   ```
   python3 manage.py runserver
   ```

## Testing

Run tests with:
```
python3 manage.py test
```