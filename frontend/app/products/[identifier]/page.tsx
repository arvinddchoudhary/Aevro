import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ProductVariantSelection } from '../../../components/products/ProductVariantSelection';
import { ProductCard } from '../../../components/products/ProductCard';
import { ErrorState } from '../../../components/ui/ErrorState';
import { getProduct, getProducts } from '../../../lib/api/catalog';

export const dynamic = 'force-dynamic';

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

        <section className="mt-8 grid gap-3 rounded-[6px] border border-[#eadfd2] bg-[#fffaf3]/80 px-4 py-4 shadow-[0_18px_45px_rgba(49,37,26,0.05)] sm:grid-cols-2 sm:px-5 lg:grid-cols-4">
          {[
            ['Free shipping', 'On all orders above ₹ 4999'],
            ['Easy returns', '14 days return policy'],
            ['Secure payments', '100% secure checkout'],
            ['Customer support', 'hello@aevro.com'],
          ].map(([title, detail]) => (
            <div key={title} className="flex gap-3 py-2">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#111111] text-xs">
                +
              </span>
              <div>
                <p className="text-sm font-semibold">{title}</p>
                <p className="mt-1 text-sm text-[#514c45]">{detail}</p>
              </div>
            </div>
          ))}
        </section>

        <section className="mt-6 grid overflow-hidden rounded-[6px] border border-[#eadfd2] bg-[#fffaf3]/70 lg:grid-cols-2">
          <div className="border-b border-[#eadfd2] p-5 sm:p-6 lg:border-b-0 lg:border-r">
            <p className="text-xs font-semibold uppercase tracking-[0.1em]">Details</p>
            <p className="mt-5 max-w-md text-sm leading-7 text-[#2f2a25]">
              Tailored with precision, these trousers feature a refined drape,
              considered proportions, and versatile styling for formal and casual
              looks.
            </p>
            <ul className="mt-5 space-y-2 text-sm text-[#2f2a25]">
              <li>• Relaxed fit</li>
              <li>• Clean front silhouette</li>
              <li>• Side pockets</li>
              <li>• Belt loops</li>
            </ul>
          </div>
          <div className="p-5 sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.1em]">
              Fabric & care
            </p>
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
