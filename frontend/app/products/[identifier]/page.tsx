import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ProductVariantSelection } from '../../../components/products/ProductVariantSelection';
import { ProductReviews } from '../../../components/products/ProductReviews';
import { ProductCard } from '../../../components/products/ProductCard';
import { ErrorState } from '../../../components/ui/ErrorState';
import { getProduct, getProductReviews, getProducts } from '../../../lib/api/catalog';
import { absoluteUrl, pageMetadata, siteName } from '../../../lib/seo';

export const dynamic = 'force-dynamic';

function ProductInformationIcon({ type }: { type: 'details' | 'care' | 'shipping' }) {
  if (type === 'details') {
    return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" aria-hidden="true"><path d="M7 5.5 10 3h4l3 2.5 3 1.5-1 4-2.5-1V21H7.5V10l-2.5 1-1-4L7 5.5Z" /><path d="M10 3v4m4-4v4" /></svg>;
  }

  if (type === 'care') {
    return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" aria-hidden="true"><path d="m7 4 3 3-6 6 3 3 6-6 3 3 4-4-9-9-4 4Z" /><path d="m12 16 3 3-3 3-3-3 3-3Z" /></svg>;
  }

  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" aria-hidden="true"><path d="m4 8 8-4 8 4v10l-8 4-8-4V8Z" /><path d="m4 8 8 4 8-4M12 12v10" /><path d="M9 6.5h6" /></svg>;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ identifier: string }>;
}): Promise<Metadata> {
  const { identifier } = await params;
  const result = await getProduct(identifier);

  if (!result.success) {
    return pageMetadata({
      title: 'Product',
      description: 'View refined AEVRO trousers and modern essentials.',
      path: `/products/${identifier}`,
      noIndex: result.statusCode === 404,
    });
  }

  const product = result.data;
  const image = product.primaryImage?.url ?? product.images[0]?.url;
  const description =
    product.description ??
    `${product.name} by ${siteName}: refined tailoring, timeless form, and everyday comfort.`;

  return {
    ...pageMetadata({
      title: product.name,
      description,
      path: `/products/${product.slug || identifier}`,
      image: image ?? '/images/brand/product-detail-black.webp',
    }),
    openGraph: {
      title: `${product.name} | ${siteName}`,
      description,
      url: absoluteUrl(`/products/${product.slug || identifier}`),
      siteName,
      images: image
        ? [
            {
              url: absoluteUrl(image),
              alt: product.primaryImage?.altText ?? product.name,
            },
          ]
        : [
            {
              url: absoluteUrl('/images/brand/product-detail-black.webp'),
              alt: product.name,
            },
          ],
      locale: 'en_IN',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${product.name} | ${siteName}`,
      description,
      images: [absoluteUrl(image ?? '/images/brand/product-detail-black.webp')],
    },
  };
}

export default async function ProductDetailsPage({
  params,
}: {
  params: Promise<{ identifier: string }>;
}) {
  const { identifier } = await params;
  const result = await getProduct(identifier);

  if (!result.success) {
    if (result.statusCode === 404) {
      notFound();
    }

    return (
      <main className="aevro-container min-h-screen py-12">
        <ErrorState
          title="Product unavailable"
          message="The product API could not be reached. Try again after the backend is running."
        />
      </main>
    );
  }

  const product = result.data;
  const [relatedResult, reviewsResult] = await Promise.all([
    getProducts({ limit: 5, sort: 'newest', category: product.category?.slug }).catch(() => null),
    getProductReviews(product.slug || identifier, { page: 1, limit: 6, sort: 'newest' }),
  ]);
  const relatedProducts =
    relatedResult?.data.filter((item) => item.id !== product.id).slice(0, 5) ?? [];

  return (
    <main className="text-[#111111]">
      <div className="aevro-container py-6 sm:py-8 lg:py-10">
        <div className="mb-6 flex flex-wrap items-center gap-2 text-sm text-[#2f2a25]">
          <Link href="/" className="hover:text-[#111111]">Home</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-[#111111]">Shop</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-[#111111]">
            {product.category?.name ?? 'Products'}
          </Link>
          <span>/</span>
          <span className="text-[#111111]">{product.name}</span>
        </div>
        <ProductVariantSelection product={product} reviewSummary={reviewsResult?.summary ?? { averageRating: null, reviewCount: 0 }} />

        {reviewsResult && reviewsResult.summary.reviewCount > 0 ? (
          <>
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{
                __html: JSON.stringify({
                  '@context': 'https://schema.org',
                  '@type': 'Product',
                  name: product.name,
                  url: absoluteUrl(`/products/${product.slug || identifier}`),
                  ...(reviewsResult.summary.reviewCount > 0
                    ? {
                        aggregateRating: {
                          '@type': 'AggregateRating',
                          ratingValue: reviewsResult.summary.averageRating,
                          reviewCount: reviewsResult.summary.reviewCount,
                          bestRating: 5,
                          worstRating: 1,
                        },
                        review: reviewsResult.data.map((review) => ({
                          '@type': 'Review',
                          author: { '@type': 'Person', name: review.reviewerName },
                          reviewRating: { '@type': 'Rating', ratingValue: review.rating, bestRating: 5, worstRating: 1 },
                          reviewBody: review.body,
                          ...(review.title ? { name: review.title } : {}),
                          datePublished: review.createdAt,
                        })),
                      }
                    : {}),
                }),
              }}
            />
          </>
        ) : null}

        <ProductReviews identifier={product.slug || identifier} initial={reviewsResult} />

        <section className="mt-8 grid gap-3 sm:grid-cols-3 sm:gap-4">
          <article className="min-h-[136px] rounded-sm border border-[#e9e1d7] bg-[#fffdf9] px-6 py-5 sm:px-7 sm:py-6">
            <div className="flex items-start gap-4"><span className="mt-0.5 h-5 w-5 shrink-0 text-[#9a8f82]"><ProductInformationIcon type="details" /></span><div><p className="text-[10px] font-semibold uppercase tracking-[0.17em] text-[#77716a]">Details</p><p className="mt-2 text-[11px] leading-[1.45] text-[#514c45]">{product.description ?? 'Tailored with precision, these trousers feature a refined drape and considered proportions.'}</p><Link href="/about/craftsmanship" className="mt-3 inline-block text-[11px] underline underline-offset-4 hover:text-[#111111]">View more</Link></div></div>
          </article>
          <article className="min-h-[136px] rounded-sm border border-[#e9e1d7] bg-[#fffdf9] px-6 py-5 sm:px-7 sm:py-6">
            <div className="flex items-start gap-4"><span className="mt-0.5 h-5 w-5 shrink-0 text-[#9a8f82]"><ProductInformationIcon type="care" /></span><div><p className="text-[10px] font-semibold uppercase tracking-[0.17em] text-[#77716a]">Fabric &amp; care</p><p className="mt-2 text-[11px] leading-[1.45] text-[#514c45]">Premium suiting fabric with a soft hand feel. Dry clean only. Cool iron if needed.</p><Link href="/help/faq" className="mt-3 inline-block text-[11px] underline underline-offset-4 hover:text-[#111111]">View more</Link></div></div>
          </article>
          <article className="min-h-[136px] rounded-sm border border-[#e9e1d7] bg-[#fffdf9] px-6 py-5 sm:px-7 sm:py-6">
            <div className="flex items-start gap-4"><span className="mt-0.5 h-5 w-5 shrink-0 text-[#9a8f82]"><ProductInformationIcon type="shipping" /></span><div><p className="text-[10px] font-semibold uppercase tracking-[0.17em] text-[#77716a]">Shipping &amp; returns</p><p className="mt-2 text-[11px] leading-[1.45] text-[#514c45]">Free shipping on orders above ₹4,000. Delivered in 7–10 business days.</p><Link href="/help/shipping" className="mt-3 inline-block text-[11px] underline underline-offset-4 hover:text-[#111111]">View more</Link></div></div>
          </article>
        </section>

        {relatedProducts.length > 0 && (
          <section className="mt-10 sm:mt-12">
            <div className="mb-6 flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-[0.08em]">
                You may also like
              </p>
              <Link
                href="/products"
                className="text-xs font-semibold uppercase tracking-[0.08em] underline-offset-8 hover:underline"
              >
                View all
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
              {relatedProducts.map((item) => (
                <ProductCard key={item.id} product={item} compact imageSizes="(max-width: 1023px) 50vw, (max-width: 1279px) 25vw, 20vw" />
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
