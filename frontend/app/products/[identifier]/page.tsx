import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ProductVariantSelection } from '../../../components/products/ProductVariantSelection';
import { ProductCard } from '../../../components/products/ProductCard';
import { ErrorState } from '../../../components/ui/ErrorState';
import { getProduct, getProducts } from '../../../lib/api/catalog';
import { absoluteUrl, pageMetadata, siteName } from '../../../lib/seo';

export const dynamic = 'force-dynamic';

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
  const relatedResult = await getProducts({
    limit: 5,
    sort: 'newest',
    category: product.category?.slug,
  }).catch(() => null);
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
        <ProductVariantSelection product={product} />

        <section className="mt-6 grid overflow-hidden rounded-[6px] border border-[#eadfd2] bg-[#fffaf3]/70 lg:grid-cols-3">
          <div className="border-b border-[#eadfd2] p-5 sm:p-6 lg:border-b-0 lg:border-r">
            <p className="text-xs font-semibold uppercase tracking-[0.1em]">Details</p>
            <p className="mt-5 max-w-md text-sm leading-7 text-[#2f2a25]">
              {product.description ??
                'Tailored with precision, these trousers feature a refined drape, considered proportions, and versatile styling for formal and casual looks.'}
            </p>
            <ul className="mt-5 space-y-2 text-sm text-[#2f2a25]">
              <li>• Relaxed fit</li>
              <li>• Clean front silhouette</li>
              <li>• Side pockets</li>
              <li>• Belt loops</li>
            </ul>
          </div>
          <div className="border-b border-[#eadfd2] p-5 sm:p-6 lg:border-b-0 lg:border-r">
            <p className="text-xs font-semibold uppercase tracking-[0.1em]">Fabric & care</p>
            <p className="mt-5 text-sm text-[#2f2a25]">
              Premium trouser-weight fabric selected for structure and drape.
            </p>
            <div className="mt-5 grid gap-3 text-sm text-[#2f2a25]">
              <span>Machine wash cold</span>
              <span>Do not bleach</span>
              <span>Iron on low</span>
              <span>Dry clean recommended</span>
            </div>
          </div>
          <div className="p-5 sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.1em]">Shipping & returns</p>
            <p className="mt-5 text-sm text-[#2f2a25]">
              Free shipping on orders above ₹4,999. Delivered in 3–7 business days across India.
            </p>
            <div className="mt-5 grid gap-3 text-sm text-[#2f2a25]">
              <span>14-day returns on unworn items</span>
              <span>Free exchanges, subject to stock</span>
              <Link href="/help/shipping" className="underline underline-offset-4 hover:text-[#111111]">
                Full shipping policy →
              </Link>
              <Link href="/help/returns" className="underline underline-offset-4 hover:text-[#111111]">
                Full returns policy →
              </Link>
            </div>
          </div>
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
                <ProductCard key={item.id} product={item} compact />
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
