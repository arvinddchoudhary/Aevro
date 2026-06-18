# AEVRO — Premium Clothing Brand

E-commerce platform for AEVRO wide-leg pleated trousers.

## Tech Stack
- Frontend: React + Vite + TypeScript + TailwindCSS
- Backend: FastAPI + SQLAlchemy + PostgreSQL
- Payments: Razorpay
- Images: Cloudinary
- Deployment: Vercel (frontend) + Railway (backend)

## Prerequisites
- Node.js v18+
- Python 3.11+
- PostgreSQL running locally
- Git

## Setup — Backend

cd backend
python -m venv venv

# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

pip install -r requirements.txt

# Setup environment
cp .env.example .env
# Edit .env with your values

# Create database
psql -U postgres -c "CREATE DATABASE aevro;"

# Run migrations
alembic upgrade head

# Seed products
python seed.py

# Start server
uvicorn app.main:app --reload --port 8000

API running at: http://localhost:8000
Docs at: http://localhost:8000/docs

## Setup — Frontend

cd frontend
npm install

# Setup environment  
cp .env.example .env
# Edit .env with your values

npm run dev

Site running at: http://localhost:5173

## Project Structure
AEVRO/
├── frontend/          React + Vite app
├── backend/           FastAPI app
│   ├── app/
│   │   ├── api/       Route handlers
│   │   ├── models/    Database models
│   │   ├── schemas/   Pydantic schemas
│   │   ├── services/  Business logic
│   │   ├── db/        Database connection
│   │   └── core/      Config & settings
│   ├── alembic/       Migrations
│   └── seed.py        Sample data
└── README.md

## Environment Variables
See backend/.env.example and frontend/.env.example

## API Endpoints
GET  /products              List all products
GET  /products/{slug}       Single product
POST /orders                Create order
POST /payments/create-order Razorpay order
POST /payments/verify       Verify payment
GET  /health                Health check
