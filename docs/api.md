# AEVRO API Notes

## Current Phase 1 API

The NestJS backend currently exposes only a health route:

```txt
GET /api/v1/health
```

## Planned API Direction

Future API routes should remain versioned:

```txt
/api/v1/health
/api/v1/products
/api/v1/categories
/api/v1/cart
/api/v1/orders
/api/v1/payments
/api/v1/uploads
/api/v1/auth
/api/v1/users
/api/v1/admin
```

## API Design Rules

- Validate all request DTOs.
- Never trust frontend totals, prices, stock, or payment status.
- Keep Razorpay secret keys backend-only.
- Return consistent error shapes.
- Use integer paise for money values.
- Bind payment verification to an internal order and Razorpay order ID.
- Make payment verification idempotent.
