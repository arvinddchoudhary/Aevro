# AEVRO Security Checklist

This checklist is for production hardening before deploying AEVRO to Vercel,
Render, Neon, Cloudinary, and Razorpay.

Do not commit real secrets. Keep production values in Vercel and Render
environment settings only.

## Backend Security

### HTTP Security Headers

- Enable Helmet in the NestJS backend.
- Keep security headers enabled in production.
- Avoid disabling content security features globally unless a specific provider
  requires it and the exception is documented.

### CORS

- Use `FRONTEND_URL` as the allowed origin.
- Enable credentials.
- Do not use wildcard origins in production.
- Keep localhost allowed only for local development.

Production expectation:

```text
origin = FRONTEND_URL
credentials = true
```

### Cookies

Auth cookies must use:

```text
httpOnly = true
secure = true in production
sameSite = none when frontend/backend are on different domains
sameSite = lax for local development
```

Do not store JWT tokens in frontend `localStorage` or `sessionStorage`.

### JWT And Refresh Sessions

- Access tokens should be short-lived.
- Refresh tokens should be long-lived but rotated.
- Store only hashed refresh tokens in the database.
- Revoke refresh sessions on logout.
- Clear cookies on logout.
- Do not expose token secrets to the frontend.

### Rate Limiting

Apply stricter rate limits to sensitive routes:

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/google`
- `POST /api/v1/auth/refresh`
- `POST /api/v1/auth/logout`
- `POST /api/v1/orders`
- `POST /api/v1/payments/*`
- `POST /api/v1/admin/uploads/*`
- `/api/v1/admin/*`

Recommended starting limits:

```text
auth login/register/google: 10 requests per minute per IP
refresh/logout: 30 requests per minute per IP
order creation: 20 requests per minute per IP
payment verification: 30 requests per minute per IP
uploads: 20 requests per 10 minutes per IP
admin routes: 120 requests per minute per IP
```

Tune these after real usage data is available.

### Admin Protection

Every admin API must require:

- JWT authentication guard
- Roles guard
- `ADMIN` role

Customer users must never be able to access admin APIs.

### Upload Safety

Cloudinary credentials must exist only in backend environment variables.

Upload endpoints should validate:

- allowed image MIME types: `image/jpeg`, `image/jpg`, `image/png`, `image/webp`
- file size limit
- max file count
- admin authorization

Reject unknown MIME types and oversized files before upload.

### Payment Verification

Razorpay security expectations:

- Backend creates Razorpay orders.
- Backend verifies Razorpay signatures.
- Frontend amount is never trusted.
- Backend uses existing order total from the database.
- Payment verification must be idempotent.
- Retried verification must not double-update payment/order status.
- Retried verification must not double-deduct inventory.

### Error Responses

Production error responses should not expose:

- database connection strings
- Prisma internals
- stack traces
- JWT secrets
- Cloudinary secrets
- Razorpay secrets
- raw provider exceptions

Logs can contain operational details, but client responses should stay clean.

## Frontend Security

- Never store JWT access or refresh tokens in `localStorage`.
- Never store JWT access or refresh tokens in `sessionStorage`.
- Use cookie-based auth with `credentials: 'include'`.
- Include credentials only for API calls that need auth/session cookies.
- Show safe user-facing errors for checkout/payment/auth failures.
- Do not render raw backend exception text in customer UI.
- Admin pages must show clear unauthorized/forbidden states.
- Do not expose backend-only environment variables through `NEXT_PUBLIC_*`.

## Production Environment Checklist

Backend required production variables:

```text
DATABASE_URL
FRONTEND_URL
BACKEND_URL
JWT_ACCESS_SECRET
JWT_REFRESH_SECRET
JWT_ACCESS_EXPIRES_IN
JWT_REFRESH_EXPIRES_IN
GOOGLE_CLIENT_ID
COOKIE_DOMAIN
CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
RAZORPAY_KEY_ID
RAZORPAY_KEY_SECRET
NODE_ENV
PORT
```

Frontend required production variables:

```text
NEXT_PUBLIC_API_URL
NEXT_PUBLIC_GOOGLE_CLIENT_ID
```

## Deployment Verification

Before switching to live traffic:

- `/api/v1/health` returns OK.
- `/api/v1/health/database` returns OK.
- Register/login/logout works with httpOnly cookies.
- Google login works with production origin.
- Admin user can access admin pages.
- Customer user cannot access admin APIs.
- Product image upload rejects non-image files.
- Product image upload rejects oversized files.
- Razorpay test payment succeeds.
- Failed Razorpay verification does not mark payment successful.
- Repeated successful Razorpay verification does not double-deduct stock.
- Checkout shows safe error messages for insufficient stock.
- No real secrets are committed to Git.
