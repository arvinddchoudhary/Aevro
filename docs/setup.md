# AEVRO Setup

## Prerequisites

Current stack:

- Node.js 18+
- npm
- Git
- Neon PostgreSQL database URL

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

Verify database connectivity after setting `DATABASE_URL`:

```bash
curl http://localhost:8000/api/v1/health/database
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

Frontend product browsing pages:

```txt
http://localhost:3000
http://localhost:3000/products
http://localhost:3000/products/wide-leg-pleated-trouser-black
http://localhost:3000/cart
```

These pages read from `NEXT_PUBLIC_API_URL`, which should point to the backend
API root, for example `http://localhost:8000/api/v1`.

The cart foundation is frontend-only in Phase 6 and uses browser
`localStorage`. No backend cart API is required yet.

## Environment Variables

Backend:

```env
NODE_ENV=development
PORT=8000
FRONTEND_URL=http://localhost:3000
CORS_ORIGINS=http://localhost:3000
DATABASE_URL=postgresql://USER:PASSWORD@HOST/aevro?sslmode=require&connect_timeout=10
DIRECT_URL=postgresql://USER:PASSWORD@DIRECT_HOST/aevro?sslmode=require&connect_timeout=10
```

## Neon + Prisma Setup

1. Create a Neon project and PostgreSQL database.
2. Copy both Neon connection strings:
   - pooled URL for `DATABASE_URL`
   - direct/unpooled URL for `DIRECT_URL`
3. Add both values to `backend/.env`.
4. Run Prisma commands from the backend folder:

```bash
cd backend
npm run prisma:generate
npm run prisma:validate
npm run prisma:dev -- --name init
npm run db:seed
```

This repository also includes an initial generated migration at:

```txt
backend/prisma/migrations/000001_init/migration.sql
```

For deployed environments, use:

```bash
cd backend
npm run prisma:deploy
```

Open Prisma Studio locally:

```bash
cd backend
npm run prisma:studio
```

Frontend:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```
