# AGENTS.md — AEVRO Project Instructions

## Project Overview

AEVRO is a production-grade clothing/e-commerce brand website. Treat this as a real scalable product, not a demo project.

The goal is to build a clean, premium, secure, maintainable, and scalable full-stack platform.

## Tech Stack

Frontend:

* Next.js
* TypeScript
* Tailwind CSS
* Deployed on Vercel

Backend:

* TypeScript
* NestJS
* REST API architecture
* Deployed on Render

Database:

* PostgreSQL using Neon.tech
* Prisma ORM
* Prisma migrations

Images:

* Cloudinary for product and media uploads

Payments:

* Razorpay
* Backend must create Razorpay orders
* Backend must verify Razorpay payment signatures
* Razorpay secret keys must never be exposed to frontend

## UI Theme

The frontend should look premium, neat, modern, and minimal.

Design direction:

* White and black theme
* Clean spacing
* Premium typography
* Responsive layouts
* Mobile-first design
* Reusable components
* Avoid cheap-looking gradients, random colors, and unnecessary animations

## Expected Project Structure

Use this structure unless the existing repository requires a safer migration plan:

/frontend
Next.js application

/backend
NestJS API

/docs
Architecture notes, API notes, setup notes

## Backend Architecture Rules

Use modular NestJS architecture.

Expected modules over time:

* auth
* users
* products
* categories
* cart
* orders
* payments
* uploads
* admin

Use:

* controllers for HTTP routes
* services for business logic
* DTOs for request validation
* guards for authentication/authorization
* Prisma for database access
* environment variables for secrets
* global validation pipe
* centralized error handling
* API versioning, preferably /api/v1

Do not put business logic directly inside controllers.

## Frontend Architecture Rules

Use:

* reusable components
* clean page structure
* feature-based organization where useful
* server components where appropriate
* client components only when interactivity is needed
* clean API integration layer
* loading, error, and empty states

Expected frontend sections over time:

* landing page
* product listing
* product details
* cart
* checkout
* login/register
* user orders
* admin dashboard

## Security Rules

Never hardcode secrets.

Use environment variables for:

* DATABASE_URL
* JWT_SECRET
* CLOUDINARY_CLOUD_NAME
* CLOUDINARY_API_KEY
* CLOUDINARY_API_SECRET
* RAZORPAY_KEY_ID
* RAZORPAY_KEY_SECRET
* FRONTEND_URL
* BACKEND_URL

Security expectations:

* validate all incoming data
* sanitize inputs where needed
* hash passwords securely
* use httpOnly cookies or carefully designed token handling
* configure CORS properly
* verify Razorpay signatures on backend
* never trust frontend payment status directly
* never expose private API keys
* use proper authorization checks for admin routes

## Working Rules For Codex

Before editing:

1. Read the repository structure.
2. Explain what already exists.
3. Explain what is missing.
4. Propose a plan.
5. Wait for confirmation before major changes.

When editing:

1. Work in small phases.
2. Do not rewrite the whole project unless explicitly asked.
3. Keep changes minimal and understandable.
4. Show the exact files changed.
5. Explain how to run and verify the changes.
6. Do not introduce unnecessary packages.
7. Do not over-engineer.
8. Keep code production-oriented.

## Commands

Before making changes, inspect:

```bash
git status
ls
find . -maxdepth 3 -type f | sort
```

After changes, verify with available commands such as:

```bash
npm install
npm run build
npm run lint
npm run test
```

If frontend and backend have separate package.json files, run commands inside each folder separately.

## Git Rules

Do not work directly on main.

Use branches such as:

```bash
fullstack/initial-setup
frontend/home-page
backend/auth-api
fullstack/auth-flow
```

Make small commits with clear messages.

## Response Format For Codex

After every task, respond with:

1. Summary of what was done
2. Files changed
3. Commands run
4. Verification result
5. Next recommended step

## Important

This project should be reliable, consistent, scalable, maintainable, performant, secure, available, responsive, modular, and extensible.

Prioritize clean architecture and long-term maintainability over quick messy implementation.
