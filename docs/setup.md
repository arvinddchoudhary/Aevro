# AEVRO Setup

## Prerequisites

Current Phase 1 stack:

- Node.js 18+
- npm
- Git

Future target stack:

- Node.js 20+
- npm
- Neon PostgreSQL database URL
- Vercel account for frontend deployment
- Render account for backend deployment

## Backend

```bash
cd backend
npm install
cp .env.example .env
npm run start:dev
```

Verify:

```bash
curl http://localhost:8000/api/v1/health
```

## Frontend

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

Verify:

```txt
http://localhost:3000
```

## Environment Variables

Backend:

```env
NODE_ENV=development
PORT=8000
FRONTEND_URL=http://localhost:3000
```

Frontend:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

## Legacy Prototype

The previous app is preserved under:

```txt
legacy/frontend-vite
legacy/backend-fastapi
```

Use it only as reference during migration.

```env
VITE_API_URL=http://localhost:8000
VITE_RAZORPAY_KEY_ID=rzp_test_your_key_here
```
