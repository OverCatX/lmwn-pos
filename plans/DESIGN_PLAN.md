# POS System Design Plan
## LINE MAN Wongnai POS - Backend & Web Dashboard

---

## 📋 Executive Summary

ระบบ POS สำหรับร้านอาหารที่เน้นความแม่นยำของข้อมูลทางการเงิน, การ traceability เมื่อเกิดปัญหา, และ maintainability ในระยะยาว

---

## 🏗️ Architecture & Design Patterns

### 1. **Layered Architecture (Clean Architecture)**
```
┌─────────────────────────────────────┐
│      Presentation Layer             │  ← Controllers, DTOs
├─────────────────────────────────────┤
│      Application Layer              │  ← Services, Use Cases
├─────────────────────────────────────┤
│      Domain Layer                   │  ← Entities, Value Objects, Business Logic
├─────────────────────────────────────┤
│      Infrastructure Layer            │  ← Database, External Services
└─────────────────────────────────────┘
```

**เหตุผล:**
- แยกความรับผิดชอบชัดเจน (Separation of Concerns)
- ทดสอบได้ง่าย (Testability)
- เปลี่ยน database หรือ framework ได้โดยไม่กระทบ business logic
- รองรับการขยายตัวในอนาคต

### 2. **Domain-Driven Design (DDD)**
- **Entities**: Order, OrderItem, Product, Discount
- **Value Objects**: Money, DiscountAmount, OrderStatus
- **Aggregates**: Order (root aggregate)
- **Domain Services**: DiscountCalculator, OrderStateMachine
- **Repositories**: OrderRepository, ProductRepository

**เหตุผล:**
- Business logic อยู่ที่ domain layer ไม่ใช่ที่ database
- Financial calculations ถูก encapsulate ใน domain entities
- ง่ายต่อการ audit และ trace

### 3. **Repository Pattern**
- Abstract data access layer
- เปลี่ยน database implementation ได้โดยไม่กระทบ business logic
- Mock ได้ง่ายสำหรับ testing

### 4. **Service Layer Pattern**
- **Application Services**: Orchestrate use cases
- **Domain Services**: Complex business logic ที่ไม่เหมาะกับ entity
- **Infrastructure Services**: External integrations

### 5. **Strategy Pattern** (สำหรับ Discount)
- รองรับ discount types หลายแบบ (Percentage, Fixed Amount, Buy X Get Y)
- ง่ายต่อการเพิ่ม discount type ใหม่

### 6. **State Machine Pattern** (สำหรับ Order Lifecycle)
- Order states: PENDING → CONFIRMED → PREPARING → READY → COMPLETED → CANCELLED
- State transitions ถูก validate และ audit

### 7. **Event-Driven Architecture** (Optional แต่แนะนำ)
- OrderCreated, OrderStatusChanged, PaymentProcessed events
- ช่วยในการ audit trail และ future integrations

---

## 📁 Folder Structure (Best Practices)

```
backend/
├── src/
│   ├── main.ts                          # Application entry point
│   │
│   ├── app.module.ts                    # Root module
│   │
│   ├── common/                          # Shared utilities
│   │   ├── decorators/
│   │   ├── filters/                     # Exception filters
│   │   ├── guards/                      # Auth guards
│   │   ├── interceptors/                # Logging, Transform
│   │   ├── pipes/                       # Validation pipes
│   │   └── utils/
│   │
│   ├── config/                          # Configuration
│   │   ├── database.config.ts
│   │   ├── app.config.ts
│   │   └── validation.config.ts
│   │
│   ├── domain/                          # Domain Layer (Core Business Logic)
│   │   ├── entities/                    # Domain Entities
│   │   │   ├── order.entity.ts
│   │   │   ├── order-item.entity.ts
│   │   │   ├── product.entity.ts
│   │   │   └── discount.entity.ts
│   │   │
│   │   ├── value-objects/               # Value Objects
│   │   │   ├── money.vo.ts
│   │   │   ├── order-status.vo.ts
│   │   │   └── discount-amount.vo.ts
│   │   │
│   │   ├── enums/                       # Domain Enums
│   │   │   ├── order-status.enum.ts
│   │   │   └── discount-type.enum.ts
│   │   │
│   │   ├── services/                    # Domain Services
│   │   │   ├── discount-calculator.service.ts
│   │   │   └── order-state-machine.service.ts
│   │   │
│   │   └── exceptions/                  # Domain Exceptions
│   │       ├── invalid-order-state.exception.ts
│   │       └── invalid-discount.exception.ts
│   │
│   ├── application/                     # Application Layer (Use Cases)
│   │   ├── orders/
│   │   │   ├── dto/                     # Data Transfer Objects
│   │   │   │   ├── create-order.dto.ts
│   │   │   │   ├── update-order.dto.ts
│   │   │   │   └── order-response.dto.ts
│   │   │   │
│   │   │   ├── services/                # Application Services
│   │   │   │   └── order.service.ts
│   │   │   │
│   │   │   └── interfaces/              # Service Interfaces
│   │   │       └── order.service.interface.ts
│   │   │
│   │   ├── products/
│   │   │   ├── dto/
│   │   │   ├── services/
│   │   │   └── interfaces/
│   │   │
│   │   └── reports/
│   │       ├── dto/
│   │       ├── services/
│   │       └── interfaces/
│   │
│   ├── infrastructure/                  # Infrastructure Layer
│   │   ├── database/
│   │   │   ├── entities/                # Database Entities (ORM)
│   │   │   │   ├── order.orm.entity.ts
│   │   │   │   └── product.orm.entity.ts
│   │   │   │
│   │   │   ├── repositories/            # Repository Implementations
│   │   │   │   ├── order.repository.ts
│   │   │   │   └── product.repository.ts
│   │   │   │
│   │   │   ├── migrations/              # Database Migrations
│   │   │   └── seeds/                   # Seed Data
│   │   │
│   │   ├── logging/                     # Logging Service
│   │   │   └── logger.service.ts
│   │   │
│   │   └── cache/                       # Caching (if needed)
│   │
│   ├── presentation/                    # Presentation Layer
│   │   ├── controllers/                 # REST Controllers
│   │   │   ├── orders/
│   │   │   │   └── orders.controller.ts
│   │   │   ├── products/
│   │   │   │   └── products.controller.ts
│   │   │   └── reports/
│   │   │       └── reports.controller.ts
│   │   │
│   │   └── validators/                  # Custom Validators
│   │       └── order.validator.ts
│   │
│   └── modules/                         # NestJS Feature Modules
│       ├── orders/
│       │   ├── orders.module.ts
│       │   ├── orders.controller.ts     # Re-export from presentation
│       │   └── orders.service.ts        # Re-export from application
│       │
│       ├── products/
│       │   └── products.module.ts
│       │
│       └── reports/
│           └── reports.module.ts
│
├── test/                                # E2E Tests
│   ├── orders/
│   └── reports/
│
├── core/                                # Core configurations
│   └── database/
│
├── package.json
├── tsconfig.json
└── README.md
```

**เหตุผลของโครงสร้าง:**
1. **แยก Domain, Application, Infrastructure ชัดเจน** - ง่ายต่อการ maintain และ test
2. **Feature-based modules** - แต่ละ feature (orders, products) มี module ของตัวเอง
3. **DTOs แยกจาก Entities** - ป้องกัน data leakage และ control API contract
4. **Repository pattern** - Abstract data access, เปลี่ยน database ได้ง่าย

---

## 💾 Database Choice & Schema Design

### Database: **PostgreSQL**

**เหตุผล:**
1. **ACID Compliance** - สำคัญมากสำหรับ financial data
2. **Transaction Support** - รองรับ complex transactions สำหรับ order processing
3. **Data Integrity** - Foreign keys, constraints, triggers
4. **Audit Trail** - ใช้ triggers หรือ audit tables ได้ง่าย
5. **Scalability** - รองรับการขยายตัวในอนาคต
6. **JSON Support** - เก็บ metadata หรือ flexible fields ได้
7. **Mature Ecosystem** - TypeORM, Prisma รองรับดี

### Schema Design

```sql
-- Products Table
products
├── id (UUID, PK)
├── name (VARCHAR)
├── price (DECIMAL(10,2))  -- ใช้ DECIMAL เพื่อความแม่นยำ
├── category (VARCHAR)
├── is_active (BOOLEAN)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)

-- Orders Table
orders
├── id (UUID, PK)
├── order_number (VARCHAR, UNIQUE)  -- Human-readable: ORD-2024-001
├── status (ENUM)  -- PENDING, CONFIRMED, PREPARING, READY, COMPLETED, CANCELLED
├── subtotal (DECIMAL(10,2))
├── discount_amount (DECIMAL(10,2))
├── total (DECIMAL(10,2))
├── created_by (VARCHAR)  -- Staff ID or name
├── created_at (TIMESTAMP)
├── updated_at (TIMESTAMP)
└── completed_at (TIMESTAMP, NULL)

-- Order Items Table
order_items
├── id (UUID, PK)
├── order_id (UUID, FK -> orders.id)
├── product_id (UUID, FK -> products.id)
├── quantity (INTEGER)
├── unit_price (DECIMAL(10,2))  -- Snapshot ราคาตอนสั่ง
├── subtotal (DECIMAL(10,2))  -- quantity * unit_price
├── discount_amount (DECIMAL(10,2))  -- Discount ของ item นี้
├── total (DECIMAL(10,2))  -- subtotal - discount_amount
└── created_at (TIMESTAMP)

-- Discounts Table (Optional - ถ้าต้องการเก็บ discount rules)
discounts
├── id (UUID, PK)
├── code (VARCHAR, UNIQUE)
├── type (ENUM)  -- PERCENTAGE, FIXED_AMOUNT, BUY_X_GET_Y
├── value (DECIMAL(10,2))
├── min_purchase (DECIMAL(10,2), NULL)
├── max_discount (DECIMAL(10,2), NULL)
├── is_active (BOOLEAN)
├── valid_from (TIMESTAMP)
└── valid_until (TIMESTAMP)

-- Order Discounts (Many-to-Many: Order can have multiple discounts)
order_discounts
├── id (UUID, PK)
├── order_id (UUID, FK -> orders.id)
├── discount_id (UUID, FK -> discounts.id, NULL)  -- NULL ถ้าเป็น manual discount
├── discount_code (VARCHAR, NULL)  -- ถ้าไม่มี discount_id
├── discount_type (ENUM)
├── discount_value (DECIMAL(10,2))
└── applied_amount (DECIMAL(10,2))  -- จำนวนที่ discount จริงๆ

-- Audit Log (สำหรับ traceability)
audit_logs
├── id (UUID, PK)
├── entity_type (VARCHAR)  -- 'order', 'order_item'
├── entity_id (UUID)
├── action (VARCHAR)  -- 'created', 'updated', 'status_changed'
├── old_value (JSONB, NULL)
├── new_value (JSONB, NULL)
├── changed_by (VARCHAR)
└── changed_at (TIMESTAMP)
```

**Design Decisions:**
1. **ใช้ DECIMAL แทน FLOAT** - ป้องกัน floating point errors ใน financial calculations
2. **Snapshot prices ใน order_items** - ราคาอาจเปลี่ยน แต่ order ต้องเก็บราคาตอนสั่ง
3. **Audit logs** - Track ทุกการเปลี่ยนแปลงสำหรับ debugging และ compliance
4. **Order number** - Human-readable สำหรับ staff
5. **Separate discount table** - รองรับ discount rules ที่ซับซ้อนในอนาคต

---

## 🔄 Order Lifecycle & State Management

### Order States
```
PENDING → CONFIRMED → PREPARING → READY → COMPLETED
   ↓
CANCELLED (can cancel from any state before COMPLETED)
```

### State Transition Rules
- **PENDING**: Order ถูกสร้าง แต่ยังไม่ confirm
- **CONFIRMED**: Order ถูก confirm แล้ว, เริ่มเตรียมอาหาร
- **PREPARING**: กำลังเตรียมอาหาร
- **READY**: อาหารพร้อมแล้ว
- **COMPLETED**: Order เสร็จสมบูรณ์ (ชำระเงินแล้ว)
- **CANCELLED**: ยกเลิก order (ต้องมี reason)

### Business Rules
1. **State transitions ต้องผ่าน validation**
2. **ไม่สามารถย้อนกลับ state ได้** (ยกเว้น cancel)
3. **เมื่อ COMPLETED แล้ว ไม่สามารถแก้ไขได้**
4. **ทุก state change ต้อง log ใน audit_logs**

---

## 💰 Discount Calculation Strategy

### Discount Types
1. **Percentage Discount** (10% off)
   - คำนวณจาก subtotal
   - อาจมี max_discount limit

2. **Fixed Amount Discount** (ลด 50 บาท)
   - ลดจำนวนเงินคงที่

3. **Item-level Discount** (ลดเฉพาะบาง item)
   - ลดที่ order_item level

4. **Order-level Discount** (ลดทั้ง order)
   - ลดที่ order level

### Calculation Order (Priority)
```
1. Calculate item subtotals (quantity * unit_price)
2. Apply item-level discounts
3. Sum all items → order subtotal
4. Apply order-level discounts (percentage or fixed)
5. Calculate final total
```

### Validation Rules
- Discount ต้องไม่เกิน subtotal
- Multiple discounts: ต้องระบุ order (first discount, then second, etc.)
- Discount ต้อง validate กับ min_purchase, valid_from, valid_until

---

## 📊 Sales Reports Design

### 1. **Daily Sales Summary**
**Contents:**
- Total orders count
- Total revenue (subtotal, discounts, final total)
- Average order value
- Orders by status breakdown
- Top selling products
- Peak hours analysis

**Why valuable:**
- Staff ดูสรุปยอดขายประจำวันได้ทันที
- เปรียบเทียบกับวันก่อนหน้าได้
- ระบุช่วงเวลาที่ขายดี

### 2. **Revenue Report (Date Range)**
**Contents:**
- Revenue trend (line chart)
- Daily breakdown table
- Discount usage summary
- Order status distribution

**Why valuable:**
- Manager วิเคราะห์ trend ยอดขาย
- ดูผลกระทบของ discount campaigns
- วางแผน inventory

### 3. **Product Performance Report**
**Contents:**
- Top 10 best sellers (quantity, revenue)
- Bottom 10 products
- Category breakdown
- Product revenue contribution

**Why valuable:**
- วางแผน menu optimization
- ระบุ products ที่ควร promote
- Inventory management

### 4. **Order Status Report**
**Contents:**
- Orders by status (count, percentage)
- Average time in each status
- Cancellation rate and reasons

**Why valuable:**
- วัดประสิทธิภาพ kitchen operations
- ระบุ bottlenecks
- ลด cancellation rate

---

## 🎯 Prioritization (3-Day Timeline)

### Day 1: Core Foundation
**Priority: HIGHEST**
1. ✅ Database setup (PostgreSQL + TypeORM)
2. ✅ Domain entities และ value objects
3. ✅ Order entity พร้อม state management
4. ✅ Basic order creation API
5. ✅ Repository pattern implementation

**Why:** Foundation ที่แข็งแรงสำคัญที่สุด

### Day 2: Business Logic & Discounts
**Priority: HIGH**
1. ✅ Discount calculation service
2. ✅ Order state machine
3. ✅ Order update APIs
4. ✅ Basic validation และ error handling
5. ✅ Audit logging

**Why:** Core business logic ที่เกี่ยวกับ financial accuracy

### Day 3: Web Dashboard & Reports
**Priority: MEDIUM-HIGH**
1. ✅ React frontend setup
2. ✅ Order list display
3. ✅ Basic sales reports (Daily Summary)
4. ✅ API documentation (Swagger/OpenAPI)

**Why:** User-facing features ที่ทำให้ระบบใช้งานได้จริง

### Out of Scope (แต่ควรทำต่อ)
- Authentication/Authorization
- Real-time updates (WebSocket)
- Advanced reports
- Product management UI
- Payment integration

---

## 🔒 Financial Accuracy & Traceability

### Strategies

1. **Decimal Precision**
   - ใช้ DECIMAL(10,2) ทุกที่ที่เกี่ยวกับเงิน
   - ใช้ library เช่น `decimal.js` สำหรับ calculations

2. **Immutable Financial Data**
   - เมื่อ order COMPLETED แล้ว ห้ามแก้ไข
   - ใช้ versioning หรือ event sourcing (optional)

3. **Audit Trail**
   - Log ทุกการเปลี่ยนแปลง
   - เก็บ old_value และ new_value
   - Track user และ timestamp

4. **Transaction Management**
   - ใช้ database transactions สำหรับ operations ที่ต้อง atomic
   - Rollback เมื่อเกิด error

5. **Validation Layers**
   - Domain validation (business rules)
   - Application validation (use case rules)
   - Presentation validation (input validation)

---

## 🧪 Testing Strategy

1. **Unit Tests**
   - Domain services (discount calculator, state machine)
   - Value objects
   - Business logic

2. **Integration Tests**
   - Repository implementations
   - Service layer
   - API endpoints

3. **E2E Tests**
   - Critical flows (create order, apply discount, complete order)

---

## 📚 Tech Stack Summary

### Backend
- **Framework**: NestJS (TypeScript)
- **ORM**: TypeORM
- **Database**: PostgreSQL
- **Validation**: class-validator, class-transformer
- **API Docs**: Swagger/OpenAPI
- **Logging**: Winston หรือ NestJS Logger

### Frontend
- **Framework**: React (TypeScript)
- **State Management**: React Query / Zustand
- **UI Library**: Ant Design หรือ Material-UI
- **Charts**: Recharts หรือ Chart.js
- **HTTP Client**: Axios

---

## 🚀 Future Improvements (Post-MVP)

1. **Real-time Updates** (WebSocket)
   - Order status updates แบบ real-time
   - Kitchen display system

2. **Advanced Analytics**
   - Predictive analytics
   - Customer behavior analysis
   - Inventory optimization

3. **Multi-store Support**
   - Store management
   - Cross-store reports

4. **Payment Integration**
   - Multiple payment methods
   - Payment reconciliation

5. **Inventory Management**
   - Stock tracking
   - Low stock alerts

6. **Customer Management**
   - Customer profiles
   - Loyalty programs

---

## 📝 Next Steps

1. Review และ approve design plan
2. Setup database และ TypeORM
3. Implement domain layer
4. Implement application layer
5. Implement infrastructure layer
6. Implement presentation layer
7. Setup frontend
8. Testing และ documentation

---

**Note:** Design นี้เน้น maintainability, testability, และ financial accuracy ตามที่ business ต้องการ
