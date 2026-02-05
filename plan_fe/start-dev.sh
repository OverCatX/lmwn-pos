#!/bin/bash

# LMWN POS Development Starter Script
# This script helps you start the development environment quickly

set -e

echo "🚀 LMWN POS System - Development Starter"
echo "========================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if PostgreSQL is running
echo "📊 Checking PostgreSQL..."
if ! psql -lqt | cut -d \| -f 1 | grep -qw lmwn2026; then
    echo -e "${YELLOW}⚠️  Database 'lmwn2026' not found${NC}"
    echo "Creating database..."
    createdb lmwn2026
    echo -e "${GREEN}✓ Database created${NC}"
else
    echo -e "${GREEN}✓ Database exists${NC}"
fi

echo ""
echo "🔧 Starting Backend..."
echo "----------------------"
cd backend

# Check if .env exists
if [ ! -f .env ]; then
    echo "Creating .env from example..."
    cp env.example .env
    echo -e "${GREEN}✓ .env created${NC}"
fi

# Install backend dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "Installing backend dependencies..."
    npm install
    echo -e "${GREEN}✓ Backend dependencies installed${NC}"
fi

# Run migrations
echo "Running database migrations..."
npm run migration:run
echo -e "${GREEN}✓ Migrations completed${NC}"

# Seed data
echo "Seeding sample data..."
npm run seed
echo -e "${GREEN}✓ Sample data seeded${NC}"

echo ""
echo "🎨 Setting up Frontend..."
echo "-------------------------"
cd ../frontend

# Install frontend dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install --legacy-peer-deps
    echo -e "${GREEN}✓ Frontend dependencies installed${NC}"
fi

echo ""
echo -e "${GREEN}✅ Setup Complete!${NC}"
echo ""
echo "📝 To start development:"
echo ""
echo "  Terminal 1 (Backend):"
echo "    cd backend && npm run start:dev"
echo ""
echo "  Terminal 2 (Frontend):"
echo "    cd frontend && npm run dev"
echo ""
echo "Then visit:"
echo "  • Frontend:  http://localhost:5173"
echo "  • Swagger:   http://localhost:3000/api/docs"
echo "  • Backend:   http://localhost:3000/api/v1"
echo ""
echo "🎉 Happy coding!"
