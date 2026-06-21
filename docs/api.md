# AEVRO API Notes

## Current API

The NestJS backend currently exposes these public routes:

```txt
GET /api/v1/health
GET /api/v1/health/database
POST /api/v1/auth/register
POST /api/v1/auth/login
POST /api/v1/auth/google
POST /api/v1/auth/refresh
POST /api/v1/auth/logout
GET /api/v1/auth/me
GET /api/v1/admin/health
GET /api/v1/admin/categories
POST /api/v1/admin/categories
GET /api/v1/admin/orders
GET /api/v1/admin/orders/:id
PATCH /api/v1/admin/orders/:id/status
GET /api/v1/admin/products
POST /api/v1/admin/products
GET /api/v1/admin/products/:id
PATCH /api/v1/admin/products/:id
PATCH /api/v1/admin/products/:id/status
POST /api/v1/admin/uploads/product-images
GET /api/v1/categories
GET /api/v1/products
GET /api/v1/products/:identifier
POST /api/v1/orders
GET /api/v1/orders/:id
GET /api/v1/orders/me
GET /api/v1/orders/me/:id
POST /api/v1/payments/razorpay/order
POST /api/v1/payments/razorpay/verify
```

`GET /api/v1/health/database` verifies Prisma can connect to PostgreSQL.

## Phase 11 Auth API

Auth supports email/password and Google login. Both methods issue the same
backend-managed session cookies:

- `aevro_access_token`: short-lived JWT access token
- `aevro_refresh_token`: long-lived opaque refresh token

Refresh tokens are stored only as hashes in the database and are rotated on
refresh. Frontend code must not store JWTs in `localStorage`.

### Register

```txt
POST /api/v1/auth/register
```

```json
{
  "name": "Customer Name",
  "email": "customer@example.com",
  "password": "password123"
}
```

### Login

```txt
POST /api/v1/auth/login
```

```json
{
  "email": "customer@example.com",
  "password": "password123"
}
```

### Google Login

```txt
POST /api/v1/auth/google
```

```json
{
  "idToken": "google_id_token_from_frontend"
}
```

The backend verifies this ID token against `GOOGLE_CLIENT_ID`.

### Refresh

```txt
POST /api/v1/auth/refresh
```

Requires the `aevro_refresh_token` httpOnly cookie. Returns the current user and
sets rotated access/refresh cookies.

### Logout

```txt
POST /api/v1/auth/logout
```

Revokes the active refresh session and clears auth cookies.

### Me

```txt
GET /api/v1/auth/me
```

Requires the `aevro_access_token` httpOnly cookie.

## Phase 12 Frontend Auth Integration

Frontend auth routes:

```txt
GET /login
GET /register
GET /account
GET /account/orders
GET /account/orders/:id
```

The frontend uses:

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/google`
- `POST /api/v1/auth/refresh`
- `POST /api/v1/auth/logout`
- `GET /api/v1/auth/me`

All auth requests use `credentials: include` so browser cookies are sent. JWT
tokens are not stored in frontend storage.

## Phase 14 Admin Foundation

Admin API routes use the same httpOnly cookie JWT session plus role-based
access control. A user must have `role: ADMIN`.

```txt
GET /api/v1/admin/health
```

Response shape:

```json
{
  "success": true,
  "data": {
    "status": "ok",
    "service": "aevro-admin-api",
    "access": "admin"
  }
}
```

Frontend admin route:

```txt
GET /admin
GET /admin/orders
GET /admin/orders/:id
GET /admin/products
GET /admin/products/new
```

The frontend shows login-required, access-denied, or the admin shell depending
on the current authenticated user.

## Phase 18 Admin Order Management

Admin order routes require the same httpOnly cookie JWT session and
`role: ADMIN`.

```txt
GET /api/v1/admin/orders
GET /api/v1/admin/orders/:id
PATCH /api/v1/admin/orders/:id/status
```

List query parameters:

```txt
page=1
limit=20
search=customer@example.com
status=PENDING
paymentStatus=PAID
sort=newest
```

Supported `sort` values are `newest` and `oldest`.

Status update body:

```json
{
  "status": "PROCESSING"
}
```

Admin order responses include customer details, shipping address, order items,
product references, order total, order status, payment status, and timestamps.
The admin UI is available at:

```txt
GET /admin/orders
GET /admin/orders/:id
```

## Phase 15 Admin Product Management

Admin product, category, and upload routes require the same httpOnly cookie JWT
session and `role: ADMIN`.

### Admin Categories

```txt
GET /api/v1/admin/categories
POST /api/v1/admin/categories
```

Create category body:

```json
{
  "name": "Trousers",
  "slug": "trousers",
  "description": "Premium trouser range."
}
```

### Admin Products

```txt
GET /api/v1/admin/products
POST /api/v1/admin/products
GET /api/v1/admin/products/:id
PATCH /api/v1/admin/products/:id
PATCH /api/v1/admin/products/:id/status
```

Create product body:

```json
{
  "name": "Wide-Leg Trouser",
  "slug": "wide-leg-trouser",
  "description": "Relaxed premium trouser.",
  "priceInPaise": 209900,
  "categoryId": "category_id",
  "status": "ACTIVE",
  "variants": [
    {
      "colorName": "Onyx",
      "colorSlug": "onyx",
      "colorHex": "#111111",
      "size": "32",
      "stock": 20,
      "sku": "AEVRO-WLT-ONX-32",
      "images": [
        {
          "url": "https://res.cloudinary.com/.../image/upload/...",
          "publicId": "aevro/products/trousers/wide-leg-trouser/onyx/image",
          "altText": "wide-leg-trouser onyx image 1",
          "sortOrder": 0,
          "isPrimary": true
        }
      ]
    }
  ]
}
```

Status update body:

```json
{
  "status": "ACTIVE"
}
```

### Product Image Upload

```txt
POST /api/v1/admin/uploads/product-images
Content-Type: multipart/form-data
```

Multipart fields:

```txt
files: up to 5 jpg, jpeg, png, or webp images
categorySlug: trousers
productSlug: wide-leg-trouser
colorSlug: onyx
```

The backend uploads files to Cloudinary under:

```txt
aevro/products/{categorySlug}/{productSlug}/{colorSlug}
```

The response includes image URLs, Cloudinary public IDs, sort order, alt text,
and primary image metadata. Cloudinary secret keys are only used by the backend.

## Phase 13 User Order History

Authenticated order history uses:

```txt
GET /api/v1/orders/me
GET /api/v1/orders/me/:id
```

These routes require the `aevro_access_token` httpOnly cookie and only return
orders where `order.userId` matches the authenticated user. Responses include
order items, product data, payment status, totals, statuses, and timestamps.

Logged-in checkout requests include cookies, so new orders are linked to the
current user. Guest checkout continues to work without an account.

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
      "color": "Black",
      "size": "30",
      "stock": 12,
      "lowStock": false,
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
          "sortOrder": 0,
          "isPrimary": true,
          "variantId": "variant_id"
        }
      ],
      "primaryImage": {
        "id": "image_id",
        "url": "https://example.com/product.jpg",
        "altText": "AEVRO black wide-leg pleated trouser",
        "sortOrder": 0,
        "isPrimary": true,
        "variantId": "variant_id"
      },
      "availableColors": [
        {
          "colorName": "Black",
          "colorSlug": "black",
          "colorHex": "#111111",
          "totalStock": 12,
          "lowStock": false
        }
      ],
      "sizesByColor": {
        "black": [
          {
            "variantId": "variant_id",
            "size": "30",
            "stock": 12,
            "lowStock": false
          }
        ]
      },
      "imagesByColor": {
        "black": [
          {
            "id": "image_id",
            "url": "https://example.com/product.jpg",
            "altText": "AEVRO black wide-leg pleated trouser",
            "sortOrder": 0,
            "isPrimary": true,
            "variantId": "variant_id"
          }
        ]
      },
      "variants": [
        {
          "id": "variant_id",
          "colorName": "Black",
          "colorSlug": "black",
          "colorHex": "#111111",
          "size": "30",
          "stock": 12,
          "lowStock": false,
          "images": [
            {
              "id": "image_id",
              "url": "https://example.com/product.jpg",
              "altText": "AEVRO black wide-leg pleated trouser",
              "sortOrder": 0,
              "isPrimary": true,
              "variantId": "variant_id"
            }
          ]
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
variant id, selected color, selected size, stock, and quantity. Backend cart
APIs should be introduced only after auth and customer identity are designed.

## Phase 7 Checkout Foundation

Checkout validates customer and shipping fields, sends a pending order request
to the backend orders API, then starts Razorpay payment through backend-created
payment orders.

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
      "variantId": "variant_id",
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
      "variantId": "variant_id",
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
        "variantId": "variant_id",
        "productName": "Wide-Leg Pleated Trouser - Black",
        "productSlug": "wide-leg-pleated-trouser-black",
        "quantity": 1,
        "unitPriceInPaise": 189900,
        "lineTotalInPaise": 189900,
        "selectedColor": "Black",
        "selectedSize": "30",
        "variant": {
          "id": "variant_id",
          "colorName": "Black",
          "colorSlug": "black",
          "colorHex": "#111111",
          "size": "30",
          "stock": 12,
          "sku": "AEVRO-WLT-BLK-30"
        }
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

## Phase 10 Razorpay Payment API

Razorpay secret keys are backend-only. The frontend never sends payment amounts
or secret keys. It asks the backend to create a Razorpay order for an existing
AEVRO order, then sends Razorpay's payment response back for backend signature
verification.

### Create Razorpay Order

```txt
POST /api/v1/payments/razorpay/order
```

Request body:

```json
{
  "orderId": "internal_order_id"
}
```

Response shape:

```json
{
  "success": true,
  "data": {
    "keyId": "rzp_test_public_key_id",
    "orderId": "internal_order_id",
    "orderNumber": "AEVRO-MABC123-XYZ789",
    "razorpayOrderId": "order_razorpay_id",
    "amountInPaise": 189900,
    "currency": "INR"
  }
}
```

### Verify Razorpay Payment

```txt
POST /api/v1/payments/razorpay/verify
```

Request body:

```json
{
  "orderId": "internal_order_id",
  "razorpayOrderId": "order_razorpay_id",
  "razorpayPaymentId": "pay_razorpay_id",
  "razorpaySignature": "signature_from_razorpay_checkout"
}
```

On successful verification, the payment is marked `PAID` and the order status is
updated to `CONFIRMED`. Invalid signatures are rejected and the payment is
marked `FAILED`.

## Phase 19 Inventory And Stock Handling

Stock is tracked at `ProductVariant` level for clothing color/size combinations.
Order creation validates product status, variant existence, backend price, and
available variant stock, but it does not deduct stock. This prevents abandoned
pending orders from consuming inventory.

Stock is deducted only after successful Razorpay payment verification. The
payment verification transaction:

- marks the payment `PAID` only once
- decrements the ordered `ProductVariant.stock`
- decrements the parent `Product.stock` total
- updates the order status to `CONFIRMED`
- returns the existing paid result on payment verification retries without
  deducting stock again

If stock is no longer available at payment verification time, the backend returns
a clear insufficient-stock error and the payment/order confirmation is not
completed.

Public and admin product responses include `lowStock` flags when stock is above
zero and at or below the current low-stock threshold.

Migration added:

```txt
000005_inventory_variant_order_items
```

Run it with:

```bash
cd backend
npm run prisma:deploy
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
