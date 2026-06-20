import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ProductVariantSelection } from '../../../components/products/ProductVariantSelection';
import { ErrorState } from '../../../components/ui/ErrorState';
import { getProduct } from '../../../lib/api/catalog';

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
      <main className="mx-auto min-h-screen max-w-6xl px-5 py-12 sm:px-8">
        <ErrorState
          title="Product unavailable"
          message="The product API could not be reached. Try again after the backend is running."
        />
      </main>
    );
  }

  const product = result.data;

  return (
    <main className="min-h-screen bg-white text-[#111111]">
      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:py-12">
        <div className="mb-8 flex items-center justify-between border-b border-[#e5e5e5] pb-5 text-sm">
          <Link href="/products" className="underline-offset-4 hover:underline">
            Back to products
          </Link>
          <span className="text-xs uppercase tracking-[0.22em] text-[#777777]">
            {product.status}
          </span>
        </div>

        <ProductVariantSelection product={product} />
      </div>
    </main>
  );
}
