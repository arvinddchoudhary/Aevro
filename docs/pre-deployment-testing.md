# AEVRO Pre-Deployment Testing Checklist

Date: 2026-07-06
Branch: `fix/full-testing-bug-pass`

## Automated Verification

| Area | Command | Result |
| --- | --- | --- |
| Backend Prisma client | `cd backend && npx prisma generate` | Passed |
| Backend production build | `cd backend && npm run build` | Passed |
| Backend typecheck | `cd backend && npm run typecheck` | Passed |
| Frontend typecheck | `cd frontend && npm run typecheck` | Passed |
| Frontend production build | `cd frontend && npm run build` | Passed |

No project test scripts are currently defined in `backend/package.json` or `frontend/package.json`.

## Bugs Found And Fixed

### Auth API bodyless requests sent JSON content type

Result: Fixed.

The frontend auth API helper sent `Content-Type: application/json` for bodyless calls such as `GET /auth/me` and `POST /auth/refresh`. Fastify can reject empty requests that declare a JSON body. The helper now only sets JSON content type when a request body exists.

Files:
- `frontend/lib/api/auth.ts`

### Wishlist bodyless DELETE requests sent JSON content type

Result: Fixed in current branch/worktree.

Wishlist API requests now only send JSON content type when a body exists, preventing Fastify from rejecting bodyless DELETE calls.

Files:
- `frontend/lib/api/wishlist.ts`

## Static Flow Checks

| Flow | Result | Notes |
| --- | --- | --- |
| Auth cookies | Passed static check | Access/refresh tokens are set as httpOnly cookies by backend. No JWT localStorage/sessionStorage usage found. |
| Register before OTP | Passed static check | Register returns verification state; user creation is handled by OTP verification service flow. |
| Login password/OTP | Passed static check | Frontend calls credential and OTP endpoints with credentials included. |
| Checkout auth requirement | Passed static check | Checkout UI blocks unauthenticated submission and order/payment endpoints use `JwtAuthGuard`. |
| Orders access | Passed static check | Order creation/list/detail endpoints require auth; user order access checks are service-side. |
| Admin access | Passed static check | Admin controllers use `JwtAuthGuard`, `RolesGuard`, and `ADMIN` role. |
| Razorpay verification | Passed static check | Signature verification, provider payment fetch, amount/currency/order matching, and captured-status checks are present. |
| Stock deduction | Passed static check | Payment success marks `stockDeductedAt` once before stock decrement, preventing duplicate deduction. |
| Razorpay webhook duplicates | Passed static check | Webhook events are stored with unique event id and duplicate events are ignored. |
| Brevo/email side effects | Passed static check | Order status notifications are async/caught and notification idempotency keys are present. |
| Wishlist | Passed static check | Auth-required APIs, duplicate prevention, product delete fallback, and no guest persistence of private data. |
| Search | Passed static check | Navbar opens overlay, live previews call real products API, and `/products?search=` is supported. |
| SEO | Passed static check | `robots.txt` and `sitemap.xml` routes build; private routes are disallowed in robots. |
| Payment methods page | Passed static check | UI is safe and does not collect raw card/UPI/wallet credentials. |

## Manual Browser Checklist

These require running local services and real browser interaction.

- Register with email/password.
- Confirm user is not created before OTP verification.
- Verify signup OTP and confirm user session is established.
- Resend signup OTP.
- Login with password.
- Login with OTP.
- Google login with configured Google OAuth client.
- Google login succeeds from `https://theaevro.com` and
  `https://www.theaevro.com`; `GOOGLE_CLIENT_ID` and
  `NEXT_PUBLIC_GOOGLE_CLIENT_ID` are the same Web Client ID.
- Invalid, expired, wrong-audience, and unverified-email Google credentials
  return safe authentication errors without token data in logs.
- A password user signing in through Google is linked without changing their
  password or role; concurrent first Google callbacks do not duplicate users.
- A matching pending signup registration is removed after successful Google
  login and cannot later overwrite account credentials through OTP verification.
- Logout.
- Simulate a logout API failure and confirm the UI remains authenticated,
  reports a safe retryable error to the caller, and re-enables logout controls.
- Refresh session after page reload.
- Confirm `/api/v1/auth/me` works after login.
- Confirm no JWTs appear in localStorage/sessionStorage.
- Logged-out checkout redirects/shows login required.
- Login/register with `redirect=/checkout` returns to checkout.
- Logged-in user can create an order.
- Order belongs to logged-in user.
- Homepage loads without console errors.
- Products page filters work: category, search, color, size, min/max price, sort.
- As an admin, arrange products, save the full order, refresh the admin page, and
  confirm the order persists. Confirm the first arranged active product appears
  first in the public default/Newest catalog and homepage product selection.
- Verify duplicate, missing, or stale product IDs are rejected by
  `PATCH /api/v1/admin/products/reorder`; confirm price and relevance sorting
  remain unaffected.
- Product detail page loads by slug/id.
- Variant selection works.
- Out-of-stock variants cannot be added to cart.
- Product image fallbacks render.
- Navbar search opens overlay and does not immediately redirect.
- Search suggestions and real product previews work.
- Search enter/button navigates to `/products?search=query`.
- Empty search results show clean empty state.
- Logged-in user can add/remove wishlist item.
- Duplicate wishlist add does not create duplicate item.
- Logged-out wishlist click redirects to login.
- `/account/wishlist` loads and remove works.
- Move to Bag either adds safely or sends user to product detail for variant selection.
- Cart add/increase/decrease/remove works.
- Cart count updates.
- Cart quantity does not exceed stock.
- Enter a valid six-digit pincode at checkout with one, two, three, and four
  cart items; confirm an estimate appears without courier names, rates, or raw
  Shiprocket data.
- Use a cart above four items; confirm checkout shows `7–10 business days` and
  does not request Shiprocket serviceability.
- `/account/orders` and `/account/orders/:id` load.
- Razorpay order creation works in configured environment.
- Razorpay payment verification succeeds for valid payment.
- Invalid Razorpay signature fails safely.
- Repeated payment verify does not double-deduct stock.
- Razorpay duplicate webhook is ignored.
- Signup OTP email sends through Brevo.
- Order confirmation customer/admin emails send after payment success.
- Admin order status emails send for PROCESSING, SHIPPED, DELIVERED, CANCELLED.
- Duplicate status emails are not sent for same event/order/customer.
- Email failures do not block payment/order/status update.
- CUSTOMER cannot access `/admin` routes.
- ADMIN can access dashboard/products/orders/uploads/homepage.
- Admin product create, category create, and image upload work.
- Admin order status update works.
- Account profile update works.
- Address add/edit/delete/set-default works.
- Payment methods page does not collect sensitive credentials.
- Legal/static pages are verified if routes are added.
- Responsive widths verified: 360, 390, 430, 768, 1024, 1280, 1440.
- No horizontal overflow on public, account, checkout, and admin pages.
- No major browser console errors or failed normal-load API calls.

## Shiprocket Pre-Deployment Checklist

- Apply migrations `000015_shiprocket_shipments` and
  `000018_shiprocket_package_review` before enabling Shiprocket.
- Confirm `SHIPROCKET_ENABLED=false` returns a clear safe admin error.
- Confirm a paid `CONFIRMED` order can create exactly one shipment.
- Open shipment review and confirm it does not create a Shiprocket order until
  **Confirm and Create Shipment** is submitted.
- Confirm quantity 1, 2, 3, and 4 load the SMALL/SMALL/LARGE/LARGE package
  recommendations; confirm quantity above 4 requires manual measurements.
- Confirm admin package overrides persist as the shipment snapshot and are sent
  to Shiprocket; invalid, zero, negative, and excessive dimensions are rejected.
- Confirm the selected saved Shiprocket pickup location and pincode are stored;
  invalid locations are rejected at confirmation.
- Repeat confirmation while it is in progress and after success to confirm no
  duplicate provider order is created.
- Confirm unpaid, cancelled, refunded, and pending orders cannot create shipments.
- Repeat Create Shipment and confirm duplicate provider shipment creation is blocked.
- Confirm missing phone, address, or delivery pincode fails before a provider call.
- Confirm an invalid pickup location returns a safe admin message.
- Load prepaid courier rates and confirm serviceability uses `cod=0`.
- Assign an AWB using an explicitly selected courier.
- Repeat AWB assignment and confirm the existing AWB is returned.
- Schedule pickup and repeat the request to confirm idempotent local behavior.
- Refresh tracking and confirm shipment/order status mapping is conservative.
- Confirm customer order detail displays AWB, courier, tracking link, and timeline.
- Confirm a customer cannot access another customer's tracking endpoint.
- Confirm an admin can access any order's shipment/tracking data.
- Send the same verified webhook twice and confirm no duplicate status side effects.
- Send a webhook with a wrong/missing `X-API-Key` and confirm it returns forbidden.
- Confirm Shiprocket webhook is not blocked by browser Origin protection.
- Confirm cancellation never automatically refunds or cancels the AEVRO order.
- Confirm RTO/undelivered updates stay in shipment state for admin handling.
- Confirm provider timeout/4xx/5xx does not corrupt payment, stock, or order data.
- Confirm logs and API responses contain no password, bearer token, or raw provider payload.

## Known Issues / Deployment Notes

- Automated end-to-end tests are not present. Manual browser testing is still required before production.
- Real Razorpay and Brevo delivery cannot be fully validated by build/typecheck alone; verify with configured sandbox/live credentials.
- The current products hero uses `plp-hero-2029-sharp.webp` to avoid stale optimized image cache and improve sharpness.
- Local shell prints harmless Starship warnings in this environment; commands still complete successfully.

## Deployment Readiness

Build/typecheck readiness: Passed.

Production readiness: Conditionally ready after completing the manual browser checklist against local/staging services, especially Razorpay, Brevo, Google login, and checkout.

## Catalog Search and Filter Checklist

- Apply migration `000016_catalog_search` on staging and confirm `pg_trgm` and its indexes exist.
- Search `trousers` and confirm trouser-category products are returned.
- Search `TROUSERS` and confirm case-insensitive results.
- Search a close typo such as `trouserz` and confirm suitable trigram matches.
- Search `black trousers` and confirm products matching both terms rank first.
- Search `wide leg trousers`, `pleated trousers`, and `formal trousers`.
- Filter by one category, multiple colors, multiple sizes, and `inStock=true`.
- Confirm variant-aware filters never duplicate a product card.
- Confirm `minPrice` and `maxPrice` use INR values and invalid ranges return HTTP 400.
- Confirm relevance, featured, newest, low-price, and high-price sorting.
- Confirm facet counts are dynamic and no unavailable hardcoded options appear.
- Confirm suggestions debounce, cancel stale requests, deduplicate, and support keyboard selection.
- Confirm empty results show clear filters and do not claim valid trousers do not exist.
- Confirm search, filters, sorting, pagination, reload, and browser back/forward preserve URL state.
- Confirm 360px, 390px, 430px, 768px, and desktop catalog layouts have no horizontal overflow.
