# AEVRO Setup

## Prerequisites

Current stack:

- Node.js 18+
- npm
- Git
- Neon PostgreSQL database URL

Future target stack:

- Node.js 20+
- npm
- Neon PostgreSQL database URL
- Vercel account for frontend deployment
- Render account for backend deployment

## Backend

```bash
cd backend
npm install
cp .env.example .env
npm run start:dev
```

Verify:

```bash
curl http://localhost:8000/api/v1/health
```

Verify database connectivity after setting `DATABASE_URL`:

```bash
curl http://localhost:8000/api/v1/health/database
```

## Frontend

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

Verify:

```txt
http://localhost:3000
```

Frontend product browsing pages:

```txt
http://localhost:3000
http://localhost:3000/products
http://localhost:3000/products/wide-leg-pleated-trouser-black
http://localhost:3000/cart
http://localhost:3000/checkout
http://localhost:3000/checkout/confirmation/order_id
http://localhost:3000/login
http://localhost:3000/register
http://localhost:3000/account
http://localhost:3000/account/profile
http://localhost:3000/account/addresses
http://localhost:3000/account/orders
http://localhost:3000/account/orders/order_id
http://localhost:3000/admin
http://localhost:3000/admin/homepage
http://localhost:3000/admin/products
http://localhost:3000/admin/products/new
```

These pages read from `NEXT_PUBLIC_API_URL`, which should point to the backend
API root, for example `http://localhost:8000/api/v1`.

Product detail pages support customer variant selection. Customers choose color
and size before adding a product to the local cart.

The cart foundation is frontend-only in Phase 6 and uses browser
`localStorage`. No backend cart API is required yet.

The checkout flow creates a pending backend order after customer and shipping
validation, opens Razorpay checkout, verifies the payment on the backend, then
clears the local cart and routes to order confirmation.

The frontend auth integration uses backend httpOnly cookies. Auth requests use
`credentials: 'include'`; JWTs are never stored in localStorage or
sessionStorage.

The user order history pages use the same httpOnly cookie session and call
protected backend routes with credentials included. Authenticated checkout
orders are linked to the current user; guest checkout still works.

The admin area uses the same auth session and requires `role: ADMIN`.
Product management pages call admin-only backend routes with credentials
included.

The homepage CMS page lets admins create and manage dynamic homepage sections.
Public `/` reads from `GET /api/v1/homepage` and falls back to built-in content
when no active CMS sections exist.

The orders foundation in Phase 8 adds backend order creation. Run migrations
before testing order creation so the shipping country column exists:

```bash
cd backend
npm run prisma:deploy
```

The auth foundation in Phase 11 adds email/password login, Google login,
httpOnly access/refresh cookies, and refresh-token rotation. Run migrations
before testing auth:

```bash
cd backend
npm run prisma:deploy
```

## Environment Variables

Backend:

```env
NODE_ENV=development
PORT=8000
FRONTEND_URL=http://localhost:3000
CORS_ORIGINS=http://localhost:3000
DATABASE_URL=postgresql://USER:PASSWORD@HOST/aevro?sslmode=require&connect_timeout=10
DIRECT_URL=postgresql://USER:PASSWORD@DIRECT_HOST/aevro?sslmode=require&connect_timeout=10
RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
RAZORPAY_WEBHOOK_SECRET=your_razorpay_webhook_secret
JWT_ACCESS_SECRET=replace_with_long_random_access_secret
JWT_REFRESH_SECRET=replace_with_long_random_refresh_secret
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=30d
GOOGLE_CLIENT_ID=your_google_oauth_client_id.apps.googleusercontent.com
COOKIE_DOMAIN=
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
BREVO_API_KEY=your_brevo_transactional_api_key
BREVO_SENDER_EMAIL=orders@aevro.com
BREVO_SENDER_NAME=AEVRO
BREVO_REPLY_TO_EMAIL=support@aevro.com
BREVO_REPLY_TO_NAME=AEVRO Support
BREVO_TEMPLATE_ORDER_CONFIRMED_CUSTOMER=1
BREVO_TEMPLATE_ORDER_CONFIRMED_ADMIN=2
BREVO_ORDER_PROCESSING_TEMPLATE_ID=3
BREVO_ORDER_SHIPPED_TEMPLATE_ID=4
BREVO_ORDER_DELIVERED_TEMPLATE_ID=5
BREVO_ORDER_CANCELLED_TEMPLATE_ID=6
BREVO_TEMPLATE_PAYMENT_FAILED=7
BREVO_TEMPLATE_EMAIL_VERIFICATION_OTP=8
AEVRO_ADMIN_EMAIL=orders@aevro.com
AEVRO_SUPPORT_EMAIL=support@aevro.com
```

## Neon + Prisma Setup

1. Create a Neon project and PostgreSQL database.
2. Copy both Neon connection strings:
   - pooled URL for `DATABASE_URL`
   - direct/unpooled URL for `DIRECT_URL`
3. Add both values to `backend/.env`.
4. Run Prisma commands from the backend folder:

```bash
cd backend
npm run prisma:generate
npm run prisma:validate
npm run prisma:dev -- --name init
npm run db:seed
```

This repository also includes an initial generated migration at:

```txt
backend/prisma/migrations/000001_init/migration.sql
backend/prisma/migrations/000002_add_order_shipping_country/migration.sql
backend/prisma/migrations/000003_hybrid_auth_foundation/migration.sql
backend/prisma/migrations/000004_product_variants_cloudinary/migration.sql
backend/prisma/migrations/000005_inventory_variant_order_items/migration.sql
backend/prisma/migrations/000006_user_profile_addresses/migration.sql
backend/prisma/migrations/000007_homepage_cms/migration.sql
backend/prisma/migrations/000008_razorpay_reliability_hardening/migration.sql
backend/prisma/migrations/000009_brevo_email_notifications/migration.sql
backend/prisma/migrations/000010_email_otp_address_label/migration.sql
```

For deployed environments, use:

```bash
cd backend
npm run prisma:deploy
```

Open Prisma Studio locally:

```bash
cd backend
npm run prisma:studio
```

Frontend:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_oauth_client_id.apps.googleusercontent.com
```

## Razorpay Test Setup

1. Create or log in to a Razorpay account.
2. Use test mode and copy the key id and key secret.
3. Add them to `backend/.env` as `RAZORPAY_KEY_ID` and
   `RAZORPAY_KEY_SECRET`.
4. Create a webhook in Razorpay and copy the webhook secret into
   `RAZORPAY_WEBHOOK_SECRET`.
5. Restart the backend after changing `.env`.
6. Run the frontend and complete checkout. The frontend receives only the
   public Razorpay key id from the backend-created payment order.

Local webhook URL:

```txt
http://localhost:8000/api/v1/webhooks/razorpay
```

Production webhook URL:

```txt
https://your-render-api.onrender.com/api/v1/webhooks/razorpay
```

## Brevo Transactional Email Setup

1. Create or log in to a Brevo account.
2. Enable transactional email.
3. Verify the sender domain before production.
4. Add DKIM, DMARC, and SPF records from Brevo to your DNS.
5. Create transactional templates and copy their numeric template IDs into
   `backend/.env`.
6. Add the backend-only `BREVO_API_KEY` to Render and local `backend/.env`.
7. Restart the backend after changing `.env`.

Recommended sender addresses:

```txt
orders@aevro.com
support@aevro.com
returns@aevro.com
no-reply@aevro.com
```

Recommended template variables:

- `customerName`
- `orderNumber`
- `otpCode`
- `verificationCode`
- `expiresInMinutes`
- `orderId`
- `paymentStatus`
- `paymentStatusText`
- `orderDate`
- `orderDateText`
- `itemsText`
- `orderTotal`
- `totalPaid`
- `shippingAddressText`
- `estimatedDelivery`
- `orderUrl`
- `supportEmail`
- `customerEmail`
- `customerPhone`
- `customerPhoneText`
- `paymentMethod`
- `adminOrderUrl`

Do not print `{{params.items}}` or `{{params.shippingAddress}}` directly in a
Brevo text block. Those are structured values for future HTML templates. Use
`{{params.itemsText}}` and `{{params.shippingAddressText}}` for the current
templates.

Customer order confirmation template:

```txt
Hi {{params.customerName}},

Thank you for shopping with AEVRO.

Your order {{params.orderNumber}} has been confirmed.

Order total: {{params.orderTotal}}
Payment status: {{params.paymentStatusText}}

Items:
{{params.itemsText}}

Shipping address:
{{params.shippingAddressText}}

Estimated delivery:
{{params.estimatedDelivery}}

View your order:
{{params.orderUrl}}

If you need help, contact us at {{params.supportEmail}}.

AEVRO
```

Admin order confirmation template:

```txt
New AEVRO order received.

Order: {{params.orderNumber}}
Customer: {{params.customerName}}
Email: {{params.customerEmail}}
Phone: {{params.customerPhoneText}}

Order total: {{params.orderTotal}}
Payment status: {{params.paymentStatusText}}

Items:
{{params.itemsText}}

Shipping address:
{{params.shippingAddressText}}

Order URL:
{{params.adminOrderUrl}}

AEVRO Admin
```

Email verification OTP template:

```txt
Hi {{params.customerName}},

Your AEVRO verification code is:

{{params.otpCode}}

This code expires in {{params.expiresInMinutes}} minutes.

If you did not create an AEVRO account, you can ignore this email.

Need help? Contact us at {{params.supportEmail}}.

AEVRO
```

Local Brevo webhook URL:

```txt
http://localhost:8000/api/v1/webhooks/brevo
```

Production Brevo webhook URL:

```txt
https://your-render-api.onrender.com/api/v1/webhooks/brevo
```

Subscribe the Brevo transactional webhook to delivery events such as `sent`,
`delivered`, `soft_bounce`, `hard_bounce`, `blocked`, `invalid`, and `error`.

Subscribe the webhook to:

- `payment.captured`
- `payment.failed`
- `order.paid`

## Google Login Setup

1. Open Google Cloud Console.
2. Create or select a project.
3. Configure the OAuth consent screen.
4. Create an OAuth 2.0 Client ID for a web application.
5. Add local frontend origin, for example:

```txt
http://localhost:3000
```

6. Copy the client id into `backend/.env`:

```env
GOOGLE_CLIENT_ID=your_google_oauth_client_id.apps.googleusercontent.com
```

7. Copy the same client id into `frontend/.env.local`:

```env
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_oauth_client_id.apps.googleusercontent.com
```

8. The frontend sends the Google ID token to:

```txt
POST http://localhost:8000/api/v1/auth/google
```

The backend verifies the ID token and creates the same httpOnly cookie session
used by email/password login.

## Cloudinary Product Image Setup

1. Create or log in to a Cloudinary account.
2. Copy the cloud name, API key, and API secret.
3. Add them to `backend/.env`:

```env
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

4. Restart the backend.
5. Log in as an admin and open:

```txt
http://localhost:3000/admin/products/new
```

Product images are uploaded through the backend to:

```txt
aevro/products/{categorySlug}/{productSlug}/{colorSlug}
```

The upload endpoint accepts up to 5 images per color. Allowed formats are jpg,
jpeg, png, and webp.

## Cloudinary Homepage CMS Image Setup

Homepage section images are uploaded through the backend admin route:

```txt
POST /api/v1/admin/uploads/homepage-image
```

The endpoint accepts one jpg, jpeg, png, or webp image at a time and stores it
under:

```txt
aevro/homepage
```

Open the admin CMS UI at:

```txt
http://localhost:3000/admin/homepage
```
## Deployment

Production deployment notes are maintained in `docs/deployment.md`.

Use Vercel for the frontend, Render for the backend, Neon for PostgreSQL,
Cloudinary for media, and Razorpay for payments. Keep production secrets in the
hosting dashboards only.
