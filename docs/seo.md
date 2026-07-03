# AEVRO SEO Checklist

This project uses the Next.js App Router metadata APIs for SEO basics.

## Public Indexable Routes

- `/`
- `/products`
- `/products/[identifier]`
- `/about`
- `/lookbook`

## Private/Noindex Routes

The following route groups are intentionally excluded from indexing:

- `/admin/*`
- `/account/*`
- `/cart`
- `/checkout`

These routes are also disallowed in `robots.ts`.

## Metadata Rules

- Global defaults live in `frontend/app/layout.tsx`.
- Shared helpers live in `frontend/lib/seo.ts`.
- Product detail metadata uses real product name, description, slug, and primary image when available.
- Social previews use Open Graph and Twitter card metadata.
- Sitemap generation includes static public pages and active product detail pages when the product API is reachable.

## Deployment Notes

- Set `NEXT_PUBLIC_SITE_URL` or `NEXT_PUBLIC_FRONTEND_URL` in production so canonical URLs, sitemap URLs, and social preview URLs point to the deployed domain.
- Keep private routes out of sitemap generation.
- Avoid keyword stuffing. Keep page descriptions natural and brand-safe.
