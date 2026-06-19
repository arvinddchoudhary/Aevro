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
  const productDetails = [
    ['Colour', product.color ?? 'Not specified'],
    ['Size', product.size ?? 'Not specified'],
    ['Stock', product.stock > 0 ? 'Available' : 'Out of stock'],
    ['SKU', product.sku ?? 'AEVRO'],
  ];

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

        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.08fr)_minmax(380px,0.92fr)] lg:gap-14">
          <section>
            <div className="aspect-[4/5] w-full overflow-hidden bg-[#f4f4f4]">
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

            <div className="mt-4 grid grid-cols-3 gap-4">
              {(product.images.length > 0 ? product.images : [primaryImage]).map(
                (image, index) => (
                  <div
                    key={image?.id ?? index}
                    className="aspect-square overflow-hidden border border-[#eeeeee] bg-[#f7f7f7]"
                  >
                    {image ? (
                      <img
                        src={image.url}
                        alt={image.altText ?? product.name}
                        className="h-full w-full object-cover"
                      />
                    ) : null}
                  </div>
                ),
              )}
            </div>
          </section>

          <section className="lg:sticky lg:top-24 lg:self-start">
            <p className="mb-4 text-xs uppercase tracking-[0.24em] text-[#777777]">
              {product.category?.name ?? 'AEVRO'}
            </p>
            <h1 className="max-w-2xl text-4xl font-light leading-[1.08] md:text-6xl">
              {product.name}
            </h1>
            <p className="mt-6 text-2xl">{formatPrice(product.priceInPaise)}</p>

            {product.description && (
              <p className="mt-8 max-w-xl text-base leading-8 text-[#555555]">
                {product.description}
              </p>
            )}

            <div className="mt-10 border-y border-[#e5e5e5]">
              {productDetails.map(([label, value]) => (
                <div
                  key={label}
                  className="grid grid-cols-[120px_1fr] border-b border-[#eeeeee] py-4 text-sm last:border-b-0"
                >
                  <span className="text-[#777777]">{label}</span>
                  <span>{value}</span>
                </div>
              ))}
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <div className="border border-[#e5e5e5] px-5 py-4">
                <p className="text-xs uppercase tracking-[0.18em] text-[#777777]">
                  Fit
                </p>
                <p className="mt-2 text-sm leading-6">Wide leg, relaxed drape</p>
              </div>
              <div className="border border-[#e5e5e5] px-5 py-4">
                <p className="text-xs uppercase tracking-[0.18em] text-[#777777]">
                  Fabric
                </p>
                <p className="mt-2 text-sm leading-6">Soft premium trouser weight</p>
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/products"
                className="inline-flex h-12 min-w-40 items-center justify-center border border-[#111111] bg-white px-7 text-sm font-medium uppercase tracking-[0.08em] text-[#111111] hover:bg-[#111111] hover:text-white"
              >
                Shop all
              </Link>
              {product.category && (
                <Link
                  href={`/products?category=${product.category.slug}`}
                  className="inline-flex h-12 min-w-40 items-center justify-center border border-[#d9d9d9] px-7 text-sm font-medium uppercase tracking-[0.08em]"
                >
                  More {product.category.name}
                </Link>
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
