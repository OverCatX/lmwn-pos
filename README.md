# LMWN POS System

Restaurant POS focused on order management and financially accurate sales reporting.

---

## How to Run

### 1. Docker (Recommended)

**Step 1:** Setup environment
```bash
cp .env.example .env
```

**Step 2:** Start services
```bash
docker-compose up --build
```

**Step 3:** Initialize database (wait 30s, then open new terminal)
```bash
docker-compose exec backend npm run migration:run
docker-compose exec backend npm run seed
```

**Step 4:** Access application
- Frontend: http://localhost:5173
- Backend: http://localhost:8080
- Swagger(API Documentation): http://localhost:8080/api/docs

---

### 2. Manual Setup

**Backend:**

1. Install & configure
```bash
cd backend
npm install
cp env.example .env
```

2. Setup database
```bash
createdb lmwn2026
npm run migration:run
npm run seed
```

3. Start server
```bash
npm run start:dev
```
Runs on http://localhost:8080

**Frontend:**

1. Install & start
```bash
cd frontend
npm install
npm run dev
```
Runs on http://localhost:5173

---

## Quick Test

```bash
# Health check
curl http://localhost:8080/api/v1/health/db

# List orders
curl http://localhost:8080/api/v1/orders
```

**Or use Swagger:** http://localhost:8080/api/docs

---

## Reset Database (Docker)

To start fresh with clean data:

```bash
docker-compose down -v
docker-compose up -d
docker-compose exec backend npm run migration:run
docker-compose exec backend npm run seed
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Port in use | `lsof -ti:8080 \| xargs kill -9` |
| Database error | `dropdb lmwn2026 && createdb lmwn2026` |
| Docker stuck | `docker-compose down -v && docker-compose up --build` |

---

## Design Decisions & Reasoning

### 1. Clean Architecture + DDD(Domain Driven Design)
- I separated domain (entities, business rules), application (use cases), infrastructure (database), and presentation (controllers) into clear layers.

- Domain layer doesn't know about TypeORM or PostgreSQL it only knows there's a repository interface.

- Used Repository Pattern and Mapper Pattern to decouple business logic from database implementation

- Can test order calculations without running database (order.calculateTotal() runs in memory)
As team scales

`Trade-off:` More setup time initially, but long-term maintainability and scaling are worth it

### 2. PostgreSQL with ACID Transactions

- Used ACID transactions for financial data accuracy—if order creation fails, payment record won't be saved

- Use `DECIMAL(10,2)` for monetary values to represent currency amounts accurately
and avoid floating-point precision errors

- Transaction wrapping: if order + items + audit log don't all save, everything rolls back

- Data consistency: daily sales totals always match sum of orders (no orphaned records)

`Trade-off:` Slower writes than NoSQL, but sales accuracy is non-negotiable

### 3. Value Objects (Money, Quantity, OrderNumber)

I use VO. becuase it helps developers clearly understand what each value represents.

- Use `Money` instead of `number` to avoid floating-point issues and reject invalid values (e.g. negative amounts)
- Create value objects with Factory methods (e.g. `Money.from()`, `Quantity.from()`) to centralize validation logic
- Use `Quantity` to prevent fractional items that are not sellable
- Generate `OrderNumber` through a factory method to enforce a consistent format across the system
- Leverage the type system to catch incorrect usage at compile time

`Trade-off:`  More domain classes, but invalid states become impossible to represent.

### 4. Immutable Completed Orders

- Orders are locked after `COMPLETED` or `CANCELLED` and cannot be modified or deleted
- This prevents changes to sales records after closing and keeps accounting data consistent
- Orders are not hard deleted; status changes are used instead
- Sales and tax reports remain accurate since historical orders are preserved

`Trade-off:` Database grows over time, but required for legal compliance

### 5. Root Cause Identification & Audit Logging

When issues occur such as sales mismatches, missing orders, or incorrect discounts,
the system is designed to make root cause analysis fast and reliable.

Key decisions:
- Record audit logs for all critical actions (order creation, status changes, discount updates)
- Store logs in an immutable `audit_logs` table to preserve historical accuracy
- Include timestamps and actors to clearly identify what happened and when
- Use explicit domain exceptions with meaningful error messages
  (e.g. "Cannot apply discount: order already completed" instead of generic 500 errors)
- Support investigation of human errors and unusual behavior through log analysis

`Trade-off:` Additional database writes and more domain-specific exceptions,
but significantly faster debugging and higher trust in financial data.

### 6. Discount Calculation Separation

- Separated discount logic into `DiscountCalculator` service—not mixed with order entity
- Easy to test: test `calculateDiscount(1000, 10%)` without creating full order
- Easy to change: if need to add discount type (like "buy 2 get 1 free"), only modify calculator
- Clear validation: `InvalidDiscountException` when discount > 100% or < 0%

`Trade-off:` Need to inject service more, but logic separation makes maintenance easier

### 7. Reports Decision

- Sales reports by time period (daily, weekly) can analyze trends
- Product performance: show best sellers (top 10) and slow movers (bottom 10)
- Analyze customer behavior: which products sell well when → know peak hours, popular items
- Real world usage: managers use to see "what sold today", "which products need more stock"
- Revenue report shows discount usage know which promotions are used frequently

`Trade-off:` More complex queries (JOINs, aggregations), but the data is actually useful

---

## Which parts were prioritized the most, and why
I prioritized the parts that can't be wrong in a POS system:
core business rules (money and discounts), the order lifecycle,
and traceability through audit logs and reports.

These areas directly affect financial correctness
and whether issues like sales mismatches, unusual discounts,
or cancelled orders impacting totals can be explained and fixed quickly.

`Trade-off:` I deliberately accepted more upfront structure (layers, value objects, audit logs)
in exchange for safer changes, faster root-cause debugging,
higher confidence in sales data, and a codebase that remains maintainable as the system and team grow.

---

## Future Improvements

If this system were used in production, I would prioritize **authentication and role-based access control ** next so audit logs can capture *who* did what, not just *what* happened. That makes accountability and fraud detection actually usable.

After that, the next most valuable features would be:

1. **Enhanced Audit System**  
   Search/filter by staff/date/discount %, alerts for abnormal discounts, and a simple dashboard. Archive old logs for performance but keep recent logs fast.

2. **Payment & Settlement + Close Shift (X/Z Reports)**  
   Reconcile cash/card/QR at shift end. Uses existing order totals + tax to highlight discrepancies.

3. **Receipt / Tax Invoice Generation**  
   Print receipts and tax invoices using existing order numbers + tax-on-net calculations.

4. **Inventory Management**  
   Auto-deduct stock on completed orders; turn slow-mover reports into reorder alerts.

5. **Real-time Kitchen Display (WebSocket)**  
   Push order status changes to kitchen screens instantly (builds on the current state machine).

---

### API DOCUMENTATION

Swagger UI: `http://localhost:8080/api/docs`  
Full details: see `backend/README.md`

---