import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ErrorState } from '../../../components/ui/ErrorState';
import { getProduct } from '../../../lib/api/catalog';
import { formatPrice } from '../../../lib/format';

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
  const primaryImage = product.images[0];

  return (
    <main className="mx-auto grid min-h-screen max-w-6xl gap-10 px-5 py-12 sm:px-8 lg:grid-cols-2">
      <section>
        <div className="aspect-[3/4] w-full bg-[#f4f4f4]">
          {primaryImage ? (
            <img
              src={primaryImage.url}
              alt={primaryImage.altText ?? product.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-xs uppercase tracking-[0.2em] text-[#999999]">
              Product image
            </div>
          )}
        </div>
      </section>

      <section className="lg:py-8">
        <Link href="/products" className="mb-8 inline-block text-sm underline underline-offset-4">
          Back to products
        </Link>
        <p className="mb-3 text-xs uppercase tracking-[0.22em] text-[#777777]">
          {product.category?.name ?? 'AEVRO'}
        </p>
        <h1 className="text-4xl font-light leading-tight md:text-5xl">{product.name}</h1>
        <p className="mt-5 text-2xl">{formatPrice(product.priceInPaise)}</p>
        {product.description && (
          <p className="mt-8 max-w-xl leading-7 text-[#555555]">{product.description}</p>
        )}

        <div className="mt-10 grid gap-4 border-y border-[#e5e5e5] py-6 text-sm sm:grid-cols-2">
          <div>
            <p className="text-[#777777]">Colour</p>
            <p className="mt-1">{product.color ?? 'Not specified'}</p>
          </div>
          <div>
            <p className="text-[#777777]">Size</p>
            <p className="mt-1">{product.size ?? 'Not specified'}</p>
          </div>
          <div>
            <p className="text-[#777777]">Stock</p>
            <p className="mt-1">{product.stock > 0 ? 'Available' : 'Out of stock'}</p>
          </div>
          <div>
            <p className="text-[#777777]">Status</p>
            <p className="mt-1">{product.status}</p>
          </div>
        </div>
      </section>
    </main>
  );
}
