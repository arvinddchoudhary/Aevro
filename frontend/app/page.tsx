import Link from 'next/link';
import { ProductCard } from '../components/products/ProductCard';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorState } from '../components/ui/ErrorState';
import { getCategories, getProducts } from '../lib/api/catalog';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const [categoriesResult, productsResult] = await Promise.allSettled([
    getCategories(),
    getProducts({ limit: 4, sort: 'newest' }),
  ]);

  const categories =
    categoriesResult.status === 'fulfilled' ? categoriesResult.value : [];
  const products =
    productsResult.status === 'fulfilled' ? productsResult.value.data : [];
  const hasCatalogError =
    categoriesResult.status === 'rejected' || productsResult.status === 'rejected';

  return (
    <main className="min-h-screen bg-white text-[#111111]">
      <section className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl flex-col justify-center px-5 py-20 sm:px-8">
        <p className="mb-5 text-xs uppercase tracking-[0.24em] text-[#666666]">
          Premium trousers. Minimal form.
        </p>
        <h1 className="max-w-4xl text-5xl font-light leading-[1.05] md:text-7xl">
          Wide-leg essentials for a cleaner everyday uniform.
        </h1>
        <p className="mt-8 max-w-2xl text-base leading-7 text-[#555555]">
          AEVRO builds quiet, premium clothing around proportion, fabric, and
          repeat wear. Start with the first trouser range.
        </p>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/products"
            className="inline-flex h-12 min-w-40 items-center justify-center border border-[#111111] bg-white px-7 text-sm font-medium uppercase tracking-[0.08em] text-[#111111] hover:bg-[#111111] hover:text-white"
          >
            Shop products
          </Link>
          {categories[0] && (
            <Link
              href={`/products?category=${categories[0].slug}`}
              className="inline-flex h-12 min-w-32 items-center justify-center border border-[#d9d9d9] bg-white px-7 text-sm font-medium uppercase tracking-[0.08em] text-[#111111] hover:border-[#111111]"
            >
              {categories[0].name}
            </Link>
          )}
        </div>
      </section>

      <section className="border-t border-[#e5e5e5] px-5 py-16 sm:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="mb-3 text-xs uppercase tracking-[0.2em] text-[#777777]">
                Latest products
              </p>
              <h2 className="text-3xl font-light">Built for repeat wear.</h2>
            </div>
            <Link href="/products" className="text-sm underline underline-offset-4">
              View all
            </Link>
          </div>

          {hasCatalogError && (
            <ErrorState
              title="Catalog unavailable"
              message="The product API could not be reached. Check the backend URL and try again."
            />
          )}

          {!hasCatalogError && products.length === 0 && (
            <EmptyState
              title="No products yet"
              message="Once active products are added, they will appear here."
            />
          )}

          {products.length > 0 && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
