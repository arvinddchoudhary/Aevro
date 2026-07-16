# AEVRO

AEVRO is a production-oriented clothing/e-commerce platform built with a separated frontend and backend.

## Stack

- Frontend: Next.js, TypeScript, Tailwind CSS, Vercel
- Backend: NestJS, TypeScript, REST API, Render
- Database: Neon PostgreSQL, Prisma ORM, Prisma migrations
- Images: Cloudinary
- Payments: Razorpay

## Project Structure

```text
frontend/  Next.js storefront and admin UI
backend/   NestJS REST API
docs/      API, setup, and deployment notes
```

## Local Development

Install and run the frontend:

```bash
cd frontend
npm install
npm run dev
```

Install and run the backend:

```bash
cd backend
npm install
npm run prisma:generate
npm run start:dev
```

Apply database migrations:

```bash
cd backend
npm run prisma:deploy
```

## Environment Files

Copy the example files and fill in local values:

```bash
cp frontend/.env.example frontend/.env.local
cp backend/.env.example backend/.env
```

Never commit real `.env` files or production secrets.

## Deployment Overview

- Deploy `frontend/` to Vercel.
- Deploy `backend/` to Render.
- Use the root `render.yaml` Blueprint to configure the Render backend safely.
- Use Neon for PostgreSQL and set `DATABASE_URL` on Render.
- Use Cloudinary credentials only on the backend.
- Use Razorpay secret key only on the backend.
- Set `NEXT_PUBLIC_API_URL` on Vercel to the deployed backend API URL.

Detailed deployment notes are in:

```text
docs/deployment.md
```

## Production Checklist

- Neon database is configured.
- Prisma migrations are deployed.
- Render backend environment variables are configured.
- Vercel frontend environment variables are configured.
- Cloudinary credentials are added to Render only.
- Razorpay keys are added to Render only.
- Google OAuth client id matches frontend and backend env values.
- Google OAuth origins include local and production frontend URLs.
- Backend CORS allows `FRONTEND_URL`.
- Auth cookies work across frontend/backend domains.
- `/api/v1/health` passes.
- `/api/v1/health/database` passes.

## Useful Docs

- `docs/api.md`
- `docs/setup.md`
- `docs/deployment.md`
