# AEVRO Architecture

## Current State

The repository currently contains the production stack foundation:

- `frontend/`: Next.js + TypeScript + Tailwind CSS skeleton
- `backend/`: NestJS + TypeScript REST API skeleton
- `docs/`: Architecture, API, setup, and deployment notes

Phase 2 adds the Prisma + Neon PostgreSQL foundation. Product, payment, upload,
and auth business logic is not implemented yet.

The backend foundation now includes:

- Environment validation
- Global request validation pipe
- Consistent HTTP error filter
- URI API versioning under `/api/v1`
- CORS driven by environment variables
- Prisma Client foundation
- Database health check route

## Target State

The production architecture is:

```txt
Aevro/
├── frontend/     Next.js + TypeScript storefront and future admin UI
├── backend/      NestJS + TypeScript REST API
└── docs/         Architecture, API, setup, and deployment notes
```

## Database Foundation

Prisma is configured inside `backend/prisma/schema.prisma` using PostgreSQL and
`DATABASE_URL` from `backend/prisma.config.ts`. The initial schema includes:

- `User`
- `Category`
- `Product`
- `ProductImage`
- `CartItem`
- `Order`
- `OrderItem`
- `Payment`

Initial enums:

- `UserRole`
- `ProductStatus`
- `OrderStatus`
- `PaymentStatus`
- `PaymentProvider`

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
