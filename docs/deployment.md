# AEVRO Deployment Guide

AEVRO is deployed as two separate services:

- Frontend: Next.js on Vercel
- Backend: NestJS API on Render
- Database: Neon PostgreSQL
- Images: Cloudinary
- Payments: Razorpay
- Email: Brevo transactional email

Do not commit real secrets. Configure production values in the hosting dashboards.

The repository includes a root-level `render.yaml` Blueprint for the backend.
It declares all supported backend environment-variable names. Secret values use
`sync: false`, so Render asks for them during initial Blueprint creation instead
of storing them in Git. Render does not import a developer's local `.env` file.

## Frontend: Vercel

### Vercel deployment steps

1. Push the repository to GitHub or GitLab.
2. In Vercel, select **Add New > Project** and import the repository.
3. Set **Root Directory** to `frontend`.
4. Keep the framework preset as **Next.js**.
5. Add the frontend environment variables shown below for Production. Add them
   to Preview as well if preview deployments should call the production API.
6. Deploy. Copy the final `https://...vercel.app` URL.
7. Set that exact URL in Render as both `FRONTEND_URL` and `CORS_ORIGINS`, then
   redeploy or restart the backend.

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

### Render Blueprint deployment steps

1. Create the Neon database and copy its pooled and direct connection strings.
2. Push `render.yaml` to the repository's deployment branch.
3. In Render, select **New > Blueprint** and connect the repository.
4. Render detects the root `render.yaml` and creates the `aevro-api` web service.
5. Enter every value requested for a `sync: false` variable. Use the Neon pooled
   URL for `DATABASE_URL` and direct URL for `DIRECT_URL`.
6. Use the intended Vercel URL for `FRONTEND_URL` and `CORS_ORIGINS`. Correct
   both after Vercel provides its final URL if necessary.
7. Keep `SHIPROCKET_ENABLED=false` until Shiprocket credentials, pickup location,
   webhook secret, and staging tests are complete.
8. Deploy and verify `/api/v1/health` and `/api/v1/health/database`.

Render prompts for `sync: false` values only when creating a Blueprint for the
first time. If the service already exists, add or update those variables from
**Service > Environment**. Never copy real values into `render.yaml`.

Set the service root to:

```bash
backend
```

Recommended Render settings:

- Runtime: Node
- Build command: `npm ci && npm run prisma:generate && npm run build && npm run prisma:deploy`
- Start command: `npm run start:prod`
- Health check path: `/api/v1/health`

The free plan does not support Render's pre-deploy command, so the Blueprint
runs the idempotent Prisma migration deployment during the build. On a paid
service, move `npm run prisma:deploy` to `preDeployCommand`.

Backend environment variables:

```bash
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...
FRONTEND_URL=https://your-vercel-app.vercel.app
CORS_ORIGINS=https://your-vercel-app.vercel.app
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
RAZORPAY_WEBHOOK_SECRET=your-razorpay-webhook-secret
BREVO_API_KEY=your-brevo-transactional-api-key
BREVO_SENDER_EMAIL=orders@aevro.com
BREVO_SENDER_NAME=AEVRO
BREVO_REPLY_TO_EMAIL=support@aevro.com
BREVO_REPLY_TO_NAME=AEVRO Support
BREVO_TEMPLATE_ORDER_CONFIRMED_CUSTOMER=1
BREVO_TEMPLATE_ORDER_CONFIRMED_ADMIN=2
BREVO_TEMPLATE_ORDER_SHIPPED=3
BREVO_TEMPLATE_ORDER_DELIVERED=4
BREVO_TEMPLATE_PAYMENT_FAILED=5
BREVO_TEMPLATE_EMAIL_VERIFICATION_OTP=6
BREVO_ORDER_PROCESSING_TEMPLATE_ID=7
BREVO_ORDER_CANCELLED_TEMPLATE_ID=8
AEVRO_ADMIN_EMAIL=orders@aevro.com
AEVRO_SUPPORT_EMAIL=support@aevro.com
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
RAZORPAY_WEBHOOK_SECRET=
```

The frontend can receive the Razorpay key id only through safe backend-created
payment order flows. Never expose `RAZORPAY_KEY_SECRET` or
`RAZORPAY_WEBHOOK_SECRET`.

Configure Razorpay webhook URL after Render deployment:

```txt
https://your-render-api.onrender.com/api/v1/webhooks/razorpay
```

Subscribe to `payment.captured`, `payment.failed`, and `order.paid`.

## Brevo Transactional Email

Add Brevo credentials only to the backend Render service:

```bash
BREVO_API_KEY=
BREVO_SENDER_EMAIL=orders@aevro.com
BREVO_SENDER_NAME=AEVRO
BREVO_REPLY_TO_EMAIL=support@aevro.com
BREVO_REPLY_TO_NAME=AEVRO Support
BREVO_TEMPLATE_ORDER_CONFIRMED_CUSTOMER=
BREVO_TEMPLATE_ORDER_CONFIRMED_ADMIN=
BREVO_TEMPLATE_ORDER_SHIPPED=
BREVO_TEMPLATE_ORDER_DELIVERED=
BREVO_TEMPLATE_PAYMENT_FAILED=
BREVO_TEMPLATE_EMAIL_VERIFICATION_OTP=
BREVO_ORDER_PROCESSING_TEMPLATE_ID=
BREVO_ORDER_CANCELLED_TEMPLATE_ID=
AEVRO_ADMIN_EMAIL=orders@aevro.com
AEVRO_SUPPORT_EMAIL=support@aevro.com
```

Never expose `BREVO_API_KEY` to Vercel or frontend code.

Recommended production sender addresses:

```txt
orders@aevro.com
support@aevro.com
returns@aevro.com
no-reply@aevro.com
```

Before going live, authenticate the sending domain in Brevo and configure DNS
records for DKIM, DMARC, and SPF.

Configure Brevo transactional webhook URL after Render deployment:

```txt
https://your-render-api.onrender.com/api/v1/webhooks/brevo
```

Subscribe to `sent`, `delivered`, `soft_bounce`, `hard_bounce`, `blocked`,
`invalid`, and `error`.

## Google Login

Use the same Google OAuth web client id in:

- Backend `GOOGLE_CLIENT_ID`
- Frontend `NEXT_PUBLIC_GOOGLE_CLIENT_ID`

Google Console authorized JavaScript origins:

```text
http://localhost:3000
https://theaevro.com
https://www.theaevro.com
```

AEVRO uses Google Identity Services' credential callback. The current flow does
not require an authorized redirect URI; add redirect URIs only if a future
implementation switches to redirect-based OAuth. `GOOGLE_CLIENT_ID` on Render
and `NEXT_PUBLIC_GOOGLE_CLIENT_ID` on Vercel must be the same Google Web Client
ID.

## Production Cookies And CORS

Production cookie expectations:

- `httpOnly: true`
- `secure: true`
- `sameSite: none` when frontend and backend are on different domains
- `sameSite: lax` can be used locally

Backend CORS must allow `FRONTEND_URL` and credentials.

Frontend authenticated requests must use credentials/include.

## Health Checks

The API supports both methods:

```bash
curl https://your-render-api.onrender.com/api/v1/health
curl -I https://your-render-api.onrender.com/api/v1/health
```

The frontend performs one best-effort `GET` when a visible browser session
opens. While the same tab remains visible, it performs a lightweight `HEAD`
every 10 minutes. Hidden tabs do not ping. Errors are ignored so a cold backend
does not break storefront rendering.

This reduces cold starts for an actively browsing customer, but it does not
guarantee continuous uptime. Render free services still spin down after 15
minutes without incoming traffic, and Render explicitly positions free services
for testing/hobby use rather than production. Use a paid instance for reliable
always-on production availability.

After deployment, verify:

```bash
curl https://your-render-api.onrender.com/api/v1/health
curl -I https://your-render-api.onrender.com/api/v1/health
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
- Razorpay test or live keys and webhook secret added only to backend.
- Razorpay webhook points to `/api/v1/webhooks/razorpay`.
- Brevo API key and template IDs added only to backend.
- Brevo webhook points to `/api/v1/webhooks/brevo`.
- Brevo sender domain has DKIM, DMARC, and SPF configured.
- Google OAuth origins configured for `http://localhost:3000`,
  `https://theaevro.com`, and `https://www.theaevro.com`.
- Render `GOOGLE_CLIENT_ID` and Vercel `NEXT_PUBLIC_GOOGLE_CLIENT_ID` reference
  the same Web Client ID.
- Google credential callback verified on both production origins; invalid and
  unverified-email credentials are rejected safely.
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

## Security Hardening

Before production launch, review the full checklist in:

```text
docs/security.md
```

At minimum, confirm CORS, cookies, rate limits, admin guards, upload validation,
Razorpay verification, and production error responses are configured safely.
