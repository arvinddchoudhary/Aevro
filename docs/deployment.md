# AEVRO Deployment Guide

AEVRO is deployed as two separate services:

- Frontend: Next.js on Vercel
- Backend: NestJS API on Render
- Database: Neon PostgreSQL
- Images: Cloudinary
- Payments: Razorpay

Do not commit real secrets. Configure production values in the hosting dashboards.

## Frontend: Vercel

Set the project root to:

```bash
frontend
```

Recommended Vercel settings:

- Framework preset: Next.js
- Build command: `npm run build`
- Install command: `npm install`
- Output directory: `.next`

Frontend environment variables:

```bash
NEXT_PUBLIC_API_URL=https://your-render-api.onrender.com/api/v1
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-web-client-id.apps.googleusercontent.com
```

`NEXT_PUBLIC_API_URL` must point to the deployed backend API base URL, including `/api/v1`.

## Backend: Render

Set the service root to:

```bash
backend
```

Recommended Render settings:

- Runtime: Node
- Build command: `npm install && npm run build && npm run prisma:generate`
- Start command: `npm run start`
- Health check path: `/api/v1/health`

Backend environment variables:

```bash
DATABASE_URL=postgresql://...
FRONTEND_URL=https://your-vercel-app.vercel.app
BACKEND_URL=https://your-render-api.onrender.com
JWT_ACCESS_SECRET=replace-with-strong-secret
JWT_REFRESH_SECRET=replace-with-strong-secret
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=30d
GOOGLE_CLIENT_ID=your-google-web-client-id.apps.googleusercontent.com
COOKIE_DOMAIN=
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
RAZORPAY_KEY_ID=rzp_live_or_test_key
RAZORPAY_KEY_SECRET=your-razorpay-secret
NODE_ENV=production
PORT=10000
```

Render provides `PORT` automatically. Keep application code listening on `process.env.PORT`.

## Neon PostgreSQL

1. Create a Neon project.
2. Copy the pooled PostgreSQL connection string.
3. Add it to Render as `DATABASE_URL`.
4. Run Prisma migrations from the backend environment:

```bash
npm run prisma:deploy
```

Use SSL in the Neon connection string. For newer PostgreSQL client behavior, prefer:

```text
sslmode=verify-full
```

## Cloudinary

Add Cloudinary credentials only to the backend Render service:

```bash
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

Frontend uploads must go through backend admin upload endpoints. Never expose `CLOUDINARY_API_SECRET` to Vercel.

## Razorpay

Add Razorpay credentials only to the backend Render service:

```bash
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
```

The frontend can receive the Razorpay key id only through safe backend-created payment order flows. Never expose `RAZORPAY_KEY_SECRET`.

## Google Login

Use the same Google OAuth web client id in:

- Backend `GOOGLE_CLIENT_ID`
- Frontend `NEXT_PUBLIC_GOOGLE_CLIENT_ID`

Google Console authorized JavaScript origins:

```text
https://your-vercel-app.vercel.app
http://localhost:3000
```

If using a custom domain, add that domain too.

## Production Cookies And CORS

Production cookie expectations:

- `httpOnly: true`
- `secure: true`
- `sameSite: none` when frontend and backend are on different domains
- `sameSite: lax` can be used locally

Backend CORS must allow `FRONTEND_URL` and credentials.

Frontend authenticated requests must use credentials/include.

## Health Checks

After deployment, verify:

```bash
curl https://your-render-api.onrender.com/api/v1/health
curl https://your-render-api.onrender.com/api/v1/health/database
```

Expected:

- `/health` returns service status.
- `/health/database` confirms database connectivity.

## Production Checklist

- Neon database created and reachable.
- Prisma migrations applied.
- Render backend environment variables configured.
- Vercel frontend environment variables configured.
- `NEXT_PUBLIC_API_URL` points to deployed Render API with `/api/v1`.
- Cloudinary credentials added only to backend.
- Razorpay test or live keys added only to backend.
- Google OAuth origins configured for localhost and deployed frontend.
- `FRONTEND_URL` matches deployed frontend URL exactly.
- CORS credentials enabled.
- Auth cookies set correctly cross-domain.
- `/api/v1/health` passes.
- `/api/v1/health/database` passes.
- Product browsing works.
- Login/register/logout works.
- Cart and checkout flow works.
- Razorpay test payment flow works.
- Admin routes remain protected.
- No real secrets committed to Git.
