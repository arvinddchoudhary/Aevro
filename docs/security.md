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

### Auth Flow And Session Cookies

Current auth flow:

- `POST /api/v1/auth/register` creates or updates a `PendingRegistration`
  record, stores the password hash and OTP hash, and sends the signup OTP.
  It does not create a `User` row and does not set auth cookies.
- `POST /api/v1/auth/verify-email-otp` verifies the pending-registration OTP.
  If valid, it creates the `User`, marks `emailVerified: true`, deletes the
  pending registration, creates a refresh session, and sets auth cookies.
- `POST /api/v1/auth/login` verifies an existing email/password account,
  creates a refresh session, and sets auth cookies.
- `POST /api/v1/auth/login/send-otp` creates or updates a login OTP for an
  existing user and sends the OTP by email. It does not set auth cookies.
- `POST /api/v1/auth/login/verify-otp` verifies and consumes the login OTP,
  creates a refresh session, and sets auth cookies.
- `POST /api/v1/auth/google` verifies the Google ID token against
  `GOOGLE_CLIENT_ID`. Google login is accepted only when Google's
  `email_verified` claim is true.
- `GET /api/v1/auth/me` reads the access-token cookie through `JwtAuthGuard`
  and returns the current user.

Cookie names:

```text
aevro_access_token
aevro_refresh_token
```

Access-token behavior:

- Stored only in the `aevro_access_token` httpOnly cookie.
- Short-lived custom HMAC JWT-style token.
- Payload includes `sub`, `email`, `role`, `type: "access"`, `iat`, and `exp`.
- The frontend does not store the access token in `localStorage` or
  `sessionStorage`.

Refresh-token behavior:

- Stored only in the `aevro_refresh_token` httpOnly cookie.
- Opaque random token, not a JWT.
- Only the HMAC hash is stored in `RefreshSession.refreshTokenHash`.
- The raw refresh token is never stored in the database.
- Refresh sessions include expiry, revoked timestamp, user agent, and IP
  metadata.

Refresh-token rotation:

- `POST /api/v1/auth/refresh` requires `aevro_refresh_token`.
- The backend hashes the cookie value and finds the matching refresh session.
- If the session is active and unexpired, the backend revokes the old session,
  creates a new access token, creates a new refresh token, stores only the new
  refresh-token hash, and sets both cookies again.
- If a revoked refresh token is presented again, the backend treats it as
  suspicious reuse, logs a warning without token values, revokes the user's
  other active refresh sessions, clears auth cookies, and returns unauthorized.

Logout behavior:

- `POST /api/v1/auth/logout` hashes the refresh cookie and revokes the matching
  active refresh session when present.
- Logout clears both auth cookies.
- Already-issued access tokens remain valid until their short expiry; logout
  prevents future refresh with the revoked refresh token.

### Origin / CSRF Protection

Because AEVRO uses httpOnly cookies and production cookies can use
`sameSite: none`, unsafe browser mutation requests are protected with strict
Origin/Referer validation.

Protected unsafe methods:

```text
POST
PUT
PATCH
DELETE
```

Safe methods do not require origin validation:

```text
GET
HEAD
OPTIONS
```

Allowed origins come from:

- `FRONTEND_URL`
- comma-separated `CORS_ORIGINS`

Requests with invalid Origin/Referer receive a safe `403` response. Browser
cookie-authenticated mutation requests without Origin/Referer are rejected when
auth cookies are present.

Webhook exceptions:

- `POST /api/v1/webhooks/razorpay` is exempt and continues to rely on Razorpay
  signature verification.
- `POST /api/v1/webhooks/brevo` is exempt and continues to rely on Brevo
  webhook handling.

### Rate Limiting

Current auth endpoints are rate-limited in process memory by IP address. Where
an email is present in the request body, the limit also applies to the
normalized email value.

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/verify-email-otp`
- `POST /api/v1/auth/resend-email-otp`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/login/send-otp`
- `POST /api/v1/auth/login/verify-otp`
- `POST /api/v1/auth/google`
- `POST /api/v1/auth/refresh`

Current limits:

```text
register: 5 requests / 15 minutes
verify-email-otp: 10 requests / 15 minutes
resend-email-otp: 5 requests / 15 minutes
login: 10 requests / 15 minutes
login/send-otp: 5 requests / 15 minutes
login/verify-otp: 10 requests / 15 minutes
google: 20 requests / 15 minutes
refresh: 60 requests / 15 minutes
```

Exceeded limits return `429` with a safe message. Tune these after real usage
data is available. For multi-instance production deployments, replace or back
this in-memory limiter with shared storage such as Redis.

### Frontend Authenticated Request Retry

Authenticated frontend API clients use a shared request helper for protected
flows:

- account/profile APIs
- account address APIs
- wishlist APIs
- order APIs
- checkout order creation
- Razorpay create/verify APIs
- admin APIs

The helper:

- always sends `credentials: 'include'`
- only sends `Content-Type: application/json` when there is a non-`FormData`
  request body
- calls `POST /api/v1/auth/refresh` once after a `401`
- retries the original request once when refresh succeeds
- avoids retrying `/auth/refresh` itself, preventing infinite refresh loops
- does not store tokens in `localStorage` or `sessionStorage`

Public product, category, and search APIs stay public and are not routed through
the authenticated retry helper.

### Auth Cleanup Command

Expired auth rows are not cleaned up automatically on every request.

Run this manually or from a scheduled backend job:

```bash
cd backend
npm run auth:cleanup
```

The command removes:

- expired refresh sessions
- revoked refresh sessions older than the cleanup cutoff
- expired pending registrations
- expired login OTP rows
- consumed login OTP rows older than the cleanup cutoff
- expired/consumed legacy email verification OTP rows

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
- Backend verifies Razorpay webhook signatures with the raw request body.
- Frontend amount is never trusted.
- Backend uses existing order total from the database.
- Payment verification must be idempotent.
- Webhook processing must be idempotent.
- Retried verification must not double-update payment/order status.
- Retried verification must not double-deduct inventory.

### Transactional Email

Brevo security expectations:

- `BREVO_API_KEY` stays backend-only.
- Frontend never calls Brevo directly.
- Order confirmation emails are sent only after backend payment verification.
- Email notification rows use unique idempotency keys to prevent duplicates.
- Razorpay verify and Razorpay webhook retries must not send duplicate emails.
- Brevo webhook updates delivery/bounce/failure status only.
- Email failures are recorded but must not fail payment success responses.
- Sender domains should be authenticated with DKIM, DMARC, and SPF.

### Error Responses

Production error responses should not expose:

- database connection strings
- Prisma internals
- stack traces
- JWT secrets
- Cloudinary secrets
- Razorpay secrets
- Brevo secrets
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

## Remaining Production Limitations

- Auth rate limiting is currently in memory. It resets on process restart and
  is not shared across multiple backend instances.
- The current Origin/Referer protection is a pragmatic CSRF defense for
  cookie-authenticated mutations. A dedicated CSRF token can be added later if
  the app needs broader cross-origin browser integrations.
- Logout revokes the refresh session and clears cookies, but existing access
  tokens remain valid until their short expiry.
- Refresh-token reuse detection revokes the user's active refresh sessions, but
  the schema does not track token families for more granular incident analysis.
- Access tokens use the existing custom HMAC JWT-style implementation. This was
  not replaced in this hardening phase.

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
RAZORPAY_WEBHOOK_SECRET
BREVO_API_KEY
BREVO_SENDER_EMAIL
BREVO_SENDER_NAME
BREVO_REPLY_TO_EMAIL
BREVO_TEMPLATE_ORDER_CONFIRMED_CUSTOMER
BREVO_TEMPLATE_ORDER_CONFIRMED_ADMIN
BREVO_TEMPLATE_ORDER_SHIPPED
BREVO_TEMPLATE_ORDER_DELIVERED
BREVO_TEMPLATE_PAYMENT_FAILED
AEVRO_ADMIN_EMAIL
AEVRO_SUPPORT_EMAIL
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
- Duplicate Razorpay webhook delivery is stored and ignored safely.
- Order-confirmation email rows are created after successful payment.
- Repeated payment verification/webhook does not create duplicate email rows.
- Brevo webhook updates email delivery status.
- Checkout shows safe error messages for insufficient stock.
- No real secrets are committed to Git.
