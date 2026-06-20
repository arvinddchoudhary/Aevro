# AEVRO API Notes

## Current Phase 1 API

The NestJS backend currently exposes these public Phase 5 routes:

```txt
GET /api/v1/health
GET /api/v1/health/database
GET /api/v1/categories
GET /api/v1/products
GET /api/v1/products/:identifier
```

`GET /api/v1/health/database` verifies Prisma can connect to PostgreSQL.

## Public Category Endpoints

### List Categories

```txt
GET /api/v1/categories
```

Query parameters:

```txt
includeEmpty=true|false
```

By default this returns categories that have at least one active product.

Example:

```bash
curl "http://localhost:8000/api/v1/categories"
```

Response shape:

```json
{
  "success": true,
  "data": [
    {
      "id": "category_id",
      "name": "Trousers",
      "slug": "trousers",
      "description": "Premium wide-leg and tailored trousers.",
      "activeProductCount": 2
    }
  ]
}
```

## Public Product Endpoints

### List Products

```txt
GET /api/v1/products
```

Query parameters:

```txt
page=1
limit=12
category=trousers
search=pleated
status=ACTIVE
minPrice=100000
maxPrice=250000
sort=newest|price_asc|price_desc
```

Price filters use integer paise, matching the backend money model.

Example:

```bash
curl "http://localhost:8000/api/v1/products?page=1&limit=12&category=trousers&sort=newest"
```

Response shape:

```json
{
  "success": true,
  "data": [
    {
      "id": "product_id",
      "name": "Wide-Leg Pleated Trouser - Black",
      "slug": "wide-leg-pleated-trouser-black",
      "description": "A high-rise double-pleated wide-leg trouser.",
      "priceInPaise": 189900,
      "sku": "AEVRO-WLPT-BLK",
      "color": "Black",
      "size": "30",
      "stock": 12,
      "status": "ACTIVE",
      "category": {
        "id": "category_id",
        "name": "Trousers",
        "slug": "trousers"
      },
      "images": [
        {
          "id": "image_id",
          "url": "https://example.com/product.jpg",
          "altText": "AEVRO black wide-leg pleated trouser",
          "sortOrder": 0
        }
      ],
      "createdAt": "2026-06-19T00:00:00.000Z",
      "updatedAt": "2026-06-19T00:00:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 12,
    "total": 1,
    "totalPages": 1,
    "hasNextPage": false,
    "hasPreviousPage": false
  }
}
```

### Product Details

```txt
GET /api/v1/products/:identifier
```

`:identifier` can be a product `slug` or product `id`. This endpoint only
returns active public products.

Example:

```bash
curl "http://localhost:8000/api/v1/products/wide-leg-pleated-trouser-black"
```

Errors use a consistent shape:

```json
{
  "success": false,
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request",
  "path": "/api/v1/example",
  "timestamp": "2026-06-19T00:00:00.000Z"
}
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
