# LMWN POS Backend API

A clean architecture backend for restaurant POS system built with NestJS, TypeScript, and PostgreSQL.

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Create database
createdb lmwn2026

# Setup environment
cp env.example .env
# Edit .env and configure your database credentials

# Run migrations
npm run migration:run

# Seed initial data (26 products + 100 orders)
npm run seed

# Start development server
npm run start:dev
```

Server will start on `http://localhost:8080`

Swagger documentation: `http://localhost:8080/api/docs`

---

## Database Setup

### Environment Configuration

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=lmwn2026
DB_LOGGING=false

# Application
PORT=8080
NODE_ENV=development
FRONTEND_URL=http://localhost:5173,https://pos.example.com
```

### Commands

```bash
# Generate new migration
npm run migration:generate -- src/infrastructure/database/migrations/MigrationName

# Run migrations
npm run migration:run

# Revert last migration
npm run migration:revert

# Seed database
npm run seed
```

### Reset Database (Fresh Start)

```bash
dropdb lmwn2026 && createdb lmwn2026
npm run migration:run
npm run seed
```

---

## API Documentation

### Base URL

```
http://localhost:8080/api/v1
```

All endpoints are versioned with `/api/v1` prefix.

### Interactive Documentation

Swagger UI: `http://localhost:8080/api/docs`

### Endpoints Overview

#### Orders API

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/orders` | List orders (paginated, filterable) |
| `GET` | `/orders/:id` | Get order details |
| `POST` | `/orders` | Create new order |
| `PATCH` | `/orders/:id/status` | Update order status |
| `PATCH` | `/orders/:id/discount` | Apply/update discount |
| `DELETE` | `/orders/:id/discount` | Remove discount |

#### Products API

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/products` | List all products |
| `GET` | `/products/:id` | Get product details |

#### Reports API

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/reports/daily-summary` | Daily sales summary |
| `GET` | `/reports/revenue` | Revenue report (7 days) |
| `GET` | `/reports/products` | Product performance analysis |

---

## API Examples

### 1. List Orders (Paginated)

```bash
GET /api/v1/orders?page=1&limit=10&status=COMPLETED
```

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `status`: Filter by status (optional)
- `fromDate`: Start date (optional)
- `toDate`: End date (optional)

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "orderNumber": "ORD-2026-0204-682",
      "status": "COMPLETED",
      "subtotal": 640.00,
      "discountAmount": 0.00,
      "tax": 44.80,
      "total": 684.80,
      "currency": "THB",
      "createdBy": "staff-demo-001",
      "createdAt": "2026-02-04T12:30:00Z",
      "items": [...]
    }
  ],
  "total": 100,
  "page": 1,
  "limit": 10
}
```

### 2. Create Order

```bash
POST /api/v1/orders
Content-Type: application/json

{
  "items": [
    {
      "productId": "uuid",
      "quantity": 2
    }
  ],
  "createdBy": "staff-001"
}
```

**Response:** `201 Created`

### 3. Apply Discount

```bash
PATCH /api/v1/orders/:id/discount
Content-Type: application/json

{
  "discountType": "PERCENTAGE",
  "discountValue": 10.0
}
```

**Discount Types:**
- `PERCENTAGE`: Value 0-100 (e.g., 10 = 10%)
- `FIXED_AMOUNT`: Value in THB (e.g., 50.00 = ฿50)

**Response:** `200 OK` with updated order

### 4. Update Order Status

```bash
PATCH /api/v1/orders/:id/status
Content-Type: application/json

{
  "status": "COMPLETED",
  "reason": "Customer paid"
}
```

**Valid Status Transitions:**
```
PENDING → CONFIRMED → PREPARING → READY → COMPLETED
        ↓            ↓           ↓      ↓
        └────────────┴───────────┴──────┴─→ CANCELLED
```

### 5. Get Daily Sales Summary

```bash
GET /api/v1/reports/daily-summary?date=2026-02-04
```

**Response:**
```json
{
  "date": "2026-02-04",
  "totalOrders": 5,
  "totalSubtotal": 2500.00,
  "totalDiscount": 250.00,
  "totalTax": 157.50,
  "totalRevenue": 2407.50,
  "averageOrderValue": 481.50,
  "ordersByStatus": [...],
  "topProducts": [...]
}
```

### 6. Get Revenue Report

```bash
GET /api/v1/reports/revenue?fromDate=2026-01-29&toDate=2026-02-04
```

**Response:**
```json
{
  "totalRevenue": 56000.00,
  "totalOrders": 100,
  "totalDiscount": 2800.00,
  "totalTax": 3920.00,
  "averageDailyRevenue": 8000.00,
  "averageOrderValue": 560.00,
  "discountUsage": [
    {
      "type": "PERCENTAGE",
      "ordersCount": 15,
      "totalDiscount": 1500.00
    }
  ]
}
```

### 7. Get Product Performance

```bash
GET /api/v1/reports/products?fromDate=2026-01-29&toDate=2026-02-04&limit=10
```

**Response:**
```json
{
  "topProducts": [
    {
      "productId": "uuid",
      "productName": "Bird Nest Soup",
      "totalRevenue": 5000.00,
      "totalQuantity": 10,
      "orderCount": 8,
      "avgQuantityPerOrder": 1.25
    }
  ],
  "bottomProducts": [...],
  "categoryBreakdown": [...]
}
```

---

## Error Handling

All endpoints return consistent error responses:

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request",
  "timestamp": "2026-02-04T12:00:00.000Z",
  "path": "/api/v1/orders"
}
```

**Common Status Codes:**
- `200`: Success
- `201`: Created
- `400`: Bad Request (validation error)
- `404`: Not Found
- `409`: Conflict (business rule violation)
- `500`: Internal Server Error

---

## Architecture

```
src/
├── domain/              # Business logic (entities, value objects)
│   ├── order/          # Order aggregate
│   ├── product/        # Product aggregate
│   ├── discount/       # Discount domain
│   └── shared/         # Shared domain logic
├── application/         # Use cases and DTOs
│   ├── orders/
│   ├── products/
│   └── reports/
├── infrastructure/      # External dependencies
│   ├── database/       # TypeORM, repositories, migrations
│   └── logging/        # Audit logs
└── presentation/        # HTTP layer (controllers)
    └── controllers/
```

**Key Features:**
- Clean Architecture with DDD principles
- Feature-first organization (Bounded Contexts)
- Financial accuracy with `decimal.js`
- Audit logging for all transactions
- Type-safe with strict TypeScript
- API versioning (v1)

---

## Development

```bash
# Start in watch mode
npm run start:dev

# Build
npm run build

# Start production
npm run start:prod

# Type check
npm run build

# Lint
npm run lint
```

---

## Testing

### Check Database Connection

```bash
curl http://localhost:8080/api/v1/health/db
```

### Test API with Swagger

1. Open `http://localhost:8080/api/docs`
2. Click "Try it out" on any endpoint
3. Fill in parameters
4. Execute and see response

### Test Order Creation Flow

```bash
# 1. Get products
curl http://localhost:8080/api/v1/products

# 2. Create order
curl -X POST http://localhost:8080/api/v1/orders \
  -H "Content-Type: application/json" \
  -d '{
    "items": [{"productId": "...", "quantity": 2}],
    "createdBy": "test-staff"
  }'

# 3. Apply discount
curl -X PATCH http://localhost:8080/api/v1/orders/{orderId}/discount \
  -H "Content-Type: application/json" \
  -d '{"discountType": "PERCENTAGE", "discountValue": 10}'
```

---

## Financial Accuracy

The system ensures accurate financial calculations:

- **Tax**: 7% VAT applied on net amount (after discount)
- **Calculation**: `Total = (Subtotal - Discount) × 1.07`
- **Precision**: All monetary values use `DECIMAL(10,2)` in database
- **Library**: `decimal.js` prevents floating-point errors

**Example:**
```
Subtotal:  ฿1,000.00
Discount:  ฿100.00 (10%)
Net:       ฿900.00
Tax (7%):  ฿63.00
Total:     ฿963.00
```

---

## Audit Logging

All significant actions are automatically logged to `audit_logs` table:

- Order creation
- Status changes
- Discount applications/removals
- Includes: who, when, what changed

Query audit logs:

```sql
SELECT * FROM audit_logs 
WHERE entity_id = 'order-uuid' 
ORDER BY changed_at DESC;
```

---

## Tech Stack

- **Framework**: NestJS 10
- **Language**: TypeScript 5
- **Database**: PostgreSQL 14
- **ORM**: TypeORM 0.3
- **Validation**: class-validator
- **Documentation**: Swagger/OpenAPI
- **Precision Math**: decimal.js
- **Testing**: Jest

---

## Support

For issues or questions, check:
- Swagger documentation: `http://localhost:8080/api/docs`
- Source code comments
- Main project README: `../README.md`
