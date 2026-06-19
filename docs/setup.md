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

## Environment Variables

Backend:

```env
NODE_ENV=development
PORT=8000
FRONTEND_URL=http://localhost:3000
CORS_ORIGINS=http://localhost:3000
DATABASE_URL=postgresql://USER:PASSWORD@HOST/aevro?sslmode=require
```

## Neon + Prisma Setup

1. Create a Neon project and PostgreSQL database.
2. Copy the Neon PostgreSQL connection string.
3. Add it to `backend/.env` as `DATABASE_URL`.
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
