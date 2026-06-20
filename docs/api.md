# AEVRO API Notes

## Current API

The NestJS backend currently exposes these public routes:

```txt
GET /api/v1/health
GET /api/v1/health/database
GET /api/v1/categories
GET /api/v1/products
GET /api/v1/products/:identifier
POST /api/v1/orders
GET /api/v1/orders/:id
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

## Phase 6 Cart Foundation

Cart is currently frontend-only and persisted in browser `localStorage`.
There are no backend cart endpoints yet because auth and user ownership are not
implemented.

Current frontend route:

```txt
GET /cart
```

The cart stores a product snapshot with product id, slug, name, image, price,
stock, and quantity. Backend cart APIs should be introduced only after auth and
customer identity are designed.

## Phase 7 Checkout Foundation

Checkout validates customer and shipping fields, then sends a pending order
request to the backend orders API. It does not collect payment data or call
Razorpay.

Current frontend route:

```txt
GET /checkout
GET /checkout/confirmation/:id
```

Order creation payload shape:

```json
{
  "customer": {
    "fullName": "Customer Name",
    "email": "customer@example.com",
    "phone": "+91 9999999999"
  },
  "shippingAddress": {
    "addressLine": "Street address",
    "city": "Hyderabad",
    "state": "Telangana",
    "postalCode": "500001",
    "country": "India"
  },
  "items": [
    {
      "productId": "product_id",
      "quantity": 1
    }
  ]
}
```

## Phase 8 Orders API Foundation

Orders are created on the backend from customer details, shipping address, and
product IDs with quantities. The backend fetches product prices from PostgreSQL
and calculates totals itself. Frontend subtotal, total, and payment status must
not be trusted.

### Create Order

```txt
POST /api/v1/orders
```

Request body:

```json
{
  "customer": {
    "fullName": "Customer Name",
    "email": "customer@example.com",
    "phone": "+91 9999999999"
  },
  "shippingAddress": {
    "addressLine": "Street address",
    "city": "Hyderabad",
    "state": "Telangana",
    "postalCode": "500001",
    "country": "India"
  },
  "items": [
    {
      "productId": "product_id",
      "quantity": 1
    }
  ]
}
```

Response shape:

```json
{
  "success": true,
  "data": {
    "id": "order_id",
    "orderNumber": "AEVRO-MABC123-XYZ789",
    "customer": {
      "name": "Customer Name",
      "email": "customer@example.com",
      "phone": "+91 9999999999"
    },
    "shippingAddress": {
      "addressLine": "Street address",
      "city": "Hyderabad",
      "state": "Telangana",
      "postalCode": "500001",
      "country": "India"
    },
    "totalInPaise": 189900,
    "status": "PENDING",
    "items": [
      {
        "id": "order_item_id",
        "productId": "product_id",
        "productName": "Wide-Leg Pleated Trouser - Black",
        "productSlug": "wide-leg-pleated-trouser-black",
        "quantity": 1,
        "unitPriceInPaise": 189900,
        "lineTotalInPaise": 189900,
        "selectedColor": "Black",
        "selectedSize": "30"
      }
    ],
    "createdAt": "2026-06-20T00:00:00.000Z",
    "updatedAt": "2026-06-20T00:00:00.000Z"
  }
}
```

### Get Order

```txt
GET /api/v1/orders/:id
```

Example:

```bash
curl "http://localhost:8000/api/v1/orders/order_id"
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
