# AEVRO Architecture

## Current State

The repository currently contains the production stack foundation:

- `frontend/`: Next.js + TypeScript + Tailwind CSS skeleton
- `backend/`: NestJS + TypeScript REST API skeleton
- `legacy/`: preserved previous Vite/FastAPI prototype

Phase 1 intentionally contains only basic setup. No product, payment, upload,
database, or auth logic is implemented yet.

## Target State

The production architecture is:

```txt
Aevro/
├── frontend/     Next.js + TypeScript storefront and future admin UI
├── backend/      NestJS + TypeScript REST API
├── legacy/       Previous prototype kept for reference
└── docs/         Architecture, API, setup, and deployment notes
```

## Design Principles

- Keep frontend and backend clearly separated.
- Design APIs before connecting UI flows.
- Store all secrets in environment variables.
- Keep modules small and domain-focused.
- Use strict TypeScript in the final frontend and backend.
- Prefer simple production-ready patterns over unnecessary abstraction.

## Planned Backend Modules

- `auth`
- `users`
- `products`
- `categories`
- `cart`
- `orders`
- `payments`
- `uploads`
- `admin`

## Planned Frontend Sections

- Landing page
- Product listing
- Product details
- Cart
- Checkout
- Login/register
- User orders
- Admin dashboard
