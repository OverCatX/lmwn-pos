# 🚀 Start Development Guide

Quick guide to start the complete POS system (Backend + Frontend)

## Prerequisites Check

```bash
# Check Node.js version (should be 18+)
node --version

# Check PostgreSQL is running
psql --version

# Check if database exists
psql -l | grep lmwn2026
```

## Step-by-Step Instructions

### 1️⃣ Setup Database

```bash
# Create database (if not exists)
createdb lmwn2026

# Or if you need to reset everything:
dropdb lmwn2026 && createdb lmwn2026
```

### 2️⃣ Start Backend

```bash
# Terminal 1: Backend
cd backend

# Install dependencies (first time only)
npm install

# Setup environment variables
cp env.example .env
# Edit .env if needed (default: localhost:5432, db: lmwn2026)

# Run migrations
npm run migration:run

# Seed sample data
npm run seed

# Start backend server
npm run start:dev
```

**Expected output:**
```
✓ Mapped {/api/v1/orders, GET} route
✓ Mapped {/api/v1/products, GET} route
✓ Mapped {/api/v1/reports/daily-sales, GET} route
Application is running on: http://localhost:3000
Swagger docs available at: http://localhost:3000/api/docs
```

### 3️⃣ Start Frontend

```bash
# Terminal 2: Frontend
cd frontend

# Install dependencies (first time only)
npm install --legacy-peer-deps

# Start frontend dev server
npm run dev
```

**Expected output:**
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

### 4️⃣ Access the Application

- **Frontend Dashboard**: http://localhost:5173
- **Backend API**: http://localhost:3000/api/v1
- **Swagger Docs**: http://localhost:3000/api/docs

## 🧪 Testing the System

### Test Backend API (using curl or Swagger)

```bash
# 1. Get all products
curl http://localhost:3000/api/v1/products

# 2. Create an order
curl -X POST http://localhost:3000/api/v1/orders \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {"productId": "<PRODUCT_ID>", "quantity": 2}
    ],
    "createdBy": "Staff001"
  }'

# 3. Get daily sales report
curl http://localhost:3000/api/v1/reports/daily-sales

# 4. Get all orders
curl http://localhost:3000/api/v1/orders
```

### Test Frontend

1. Open http://localhost:5173
2. Click **Orders** in sidebar
3. You should see seeded orders
4. Click **Reports** in sidebar
5. You should see:
   - Daily sales summary with charts
   - Revenue trends
   - Product performance table

## ⚠️ Troubleshooting

### Backend won't start

**Error: `EADDRINUSE: address already in use :::3000`**
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or change port in backend/.env
PORT=3001
```

**Error: `database "lmwn2026" does not exist`**
```bash
createdb lmwn2026
```

**Error: `relation "products" already exists`**
```bash
# Reset database
dropdb lmwn2026 && createdb lmwn2026
cd backend && npm run migration:run && npm run seed
```

### Frontend won't start

**Error: `EADDRINUSE: address already in use :::5173`**
```bash
# Kill process on port 5173
lsof -ti:5173 | xargs kill -9
```

**Error: `Cannot connect to backend`**
- Make sure backend is running on http://localhost:3000
- Check `frontend/.env` has correct `VITE_API_BASE_URL`

**Error: `npm install fails`**
```bash
# Use legacy peer deps
npm install --legacy-peer-deps
```

## 🎯 Development Workflow

1. **Backend changes:**
   - Edit files in `backend/src/`
   - Server auto-reloads (watch mode)
   - Check http://localhost:3000/api/docs for API changes

2. **Frontend changes:**
   - Edit files in `frontend/src/`
   - Vite HMR updates instantly
   - Check browser console for errors

3. **Database changes:**
   - Create new migration: `npm run migration:create -- src/infrastructure/database/migrations/MigrationName`
   - Run migration: `npm run migration:run`
   - Revert: `npm run migration:revert`

## 📱 Quick Commands

```bash
# Check all processes
lsof -i:3000  # Backend
lsof -i:5173  # Frontend

# Reset everything
dropdb lmwn2026 && createdb lmwn2026
cd backend && npm run migration:run && npm run seed

# View logs
cd backend && tail -f logs/app.log  # If logging to file

# Check API
curl http://localhost:3000/api/v1/health
curl http://localhost:3000/api/v1/orders
```

## ✅ Checklist Before Starting

- [ ] PostgreSQL is installed and running
- [ ] Node.js 18+ is installed
- [ ] Database `lmwn2026` is created
- [ ] Backend `.env` is configured
- [ ] Backend migrations are run
- [ ] Backend seed data is loaded
- [ ] Backend server is running on port 3000
- [ ] Frontend dependencies are installed
- [ ] Frontend server is running on port 5173
- [ ] Both Swagger (http://localhost:3000/api/docs) and Frontend (http://localhost:5173) are accessible

## 🎉 Success!

If everything is working, you should be able to:
1. ✅ See orders in the frontend dashboard
2. ✅ Filter orders by status
3. ✅ View sales reports with charts
4. ✅ Create new orders via API
5. ✅ See audit logs in database
