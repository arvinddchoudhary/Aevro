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
http://localhost:3000/account/orders
http://localhost:3000/account/orders/order_id
http://localhost:3000/admin
http://localhost:3000/admin/products
http://localhost:3000/admin/products/new
```

These pages read from `NEXT_PUBLIC_API_URL`, which should point to the backend
API root, for example `http://localhost:8000/api/v1`.

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
JWT_ACCESS_SECRET=replace_with_long_random_access_secret
JWT_REFRESH_SECRET=replace_with_long_random_refresh_secret
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=30d
GOOGLE_CLIENT_ID=your_google_oauth_client_id.apps.googleusercontent.com
COOKIE_DOMAIN=
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
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
4. Restart the backend after changing `.env`.
5. Run the frontend and complete checkout. The frontend receives only the
   public Razorpay key id from the backend-created payment order.

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
