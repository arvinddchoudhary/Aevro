# AEVRO

Premium clothing brand commerce platform.

This repository is now structured for the production-grade stack:

- Frontend: Next.js, TypeScript, Tailwind CSS, Vercel
- Backend: NestJS, TypeScript, REST APIs, Render
- Database: Neon PostgreSQL, Prisma ORM
- Media: Cloudinary
- Payments: Razorpay

Phase 1 creates the clean project foundation only. Product APIs, Prisma,
Cloudinary, Razorpay, auth, and admin features are intentionally not added yet.

## Repository Structure

```txt
Aevro/
├── docs/                 Project notes, setup, architecture, API, deployment
├── frontend/             Next.js + TypeScript frontend
├── backend/              NestJS + TypeScript backend
├── legacy/               Preserved previous Vite/FastAPI prototype
├── README.md             Root setup and project overview
└── sampleclip.mp4
```

## Local Setup

### Backend

```bash
cd backend
npm install
cp .env.example .env
npm run start:dev
```

Backend:

```txt
http://localhost:8000/api/v1/health
```

Backend validation/build checks:

```bash
npm run typecheck
npm run build
```

Prisma checks:

```bash
npm run prisma:generate
npm run prisma:validate
```

After setting a real Neon `DATABASE_URL`, run migrations:

```bash
npm run prisma:dev -- --name init
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

Frontend:

```txt
http://localhost:3000
```

## Environment Files

```txt
backend/.env.example
frontend/.env.example
```

Never commit real `.env` files or secret keys.

## Legacy Prototype

The previous prototype is preserved for reference:

```txt
legacy/frontend-vite
legacy/backend-fastapi
```

## Documentation

Start here:

- [Architecture](docs/architecture.md)
- [Setup](docs/setup.md)
- [API Notes](docs/api.md)
- [Deployment](docs/deployment.md)

## Phase 1 Status

Done:

- Created clean `frontend/` Next.js skeleton.
- Created clean `backend/` NestJS skeleton.
- Preserved previous implementation under `legacy/`.
- Added project docs.

Not added yet:

- Prisma and Neon database setup
- Cloudinary uploads
- Razorpay payments
- Auth
- Product/order/cart business logic
