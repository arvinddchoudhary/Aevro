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

## Shipping Architecture

Shiprocket is isolated in `backend/src/shiprocket`. The controller handles HTTP
contracts, `ShiprocketService` owns eligibility, idempotency, mapping, and state
transitions, and `ShiprocketClient` owns authenticated provider HTTP calls and
token caching. Orders retain their simple commercial lifecycle while `Shipment`
stores the detailed fulfilment lifecycle.

Version 1 is deliberately manual:

```txt
Razorpay verified -> Order CONFIRMED -> admin creates shipment
-> admin selects courier/AWB -> admin schedules pickup
-> webhook or manual refresh updates tracking -> customer sees sanitized status
```

The payment service does not import or invoke Shiprocket. Provider failure
therefore cannot roll back payment verification, stock deduction, or order
confirmation. A unique one-to-one `Shipment.orderId` and unique provider IDs
prevent accidental duplicates. Webhook event hashes make repeated updates
idempotent. Raw provider payloads remain backend-only and no token or password is
stored in PostgreSQL.

Order status mapping is intentionally conservative: created/AWB/pickup moves a
confirmed order to `PROCESSING`; pickup/in-transit/out-for-delivery moves it to
`SHIPPED`; delivery moves it to `DELIVERED`. Shipment cancellation, failure, and
RTO do not automatically cancel or refund an order.

A later version may auto-create shipments after stable staging/production
operation, but it must reuse this service and idempotency boundary rather than
adding provider calls to payment verification.
