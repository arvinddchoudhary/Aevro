import Link from 'next/link';
import { ProductCard } from '../../components/products/ProductCard';
import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorState } from '../../components/ui/ErrorState';
import { getCategories, getProducts } from '../../lib/api/catalog';
import type { ProductSort } from '../../types/catalog';

export const dynamic = 'force-dynamic';

type SearchParams = Record<string, string | string[] | undefined>;

function getStringParam(searchParams: SearchParams, key: string) {
  const value = searchParams[key];
  return Array.isArray(value) ? value[0] : value;
}

function getNumberParam(searchParams: SearchParams, key: string) {
  const value = getStringParam(searchParams, key);
  const parsed = value ? Number(value) : undefined;

  return Number.isFinite(parsed) ? parsed : undefined;
}

function buildProductsHref(
  currentParams: SearchParams,
  updates: Record<string, string | number | undefined>,
) {
  const params = new URLSearchParams();

  Object.entries(currentParams).forEach(([key, value]) => {
    const normalized = Array.isArray(value) ? value[0] : value;

    if (normalized) {
      params.set(key, normalized);
    }
  });

  Object.entries(updates).forEach(([key, value]) => {
    if (value === undefined || value === '') {
      params.delete(key);
    } else {
      params.set(key, String(value));
    }
  });

  const query = params.toString();

  return query ? `/products?${query}` : '/products';
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const params = (await searchParams) ?? {};
  const page = Math.max(getNumberParam(params, 'page') ?? 1, 1);
  const category = getStringParam(params, 'category');
  const search = getStringParam(params, 'search');
  const minPrice = getNumberParam(params, 'minPrice');
  const maxPrice = getNumberParam(params, 'maxPrice');
  const sort = (getStringParam(params, 'sort') as ProductSort | undefined) ?? 'newest';

  const [categoriesResult, productsResult] = await Promise.allSettled([
    getCategories({ includeEmpty: true }),
    getProducts({
      page,
      limit: 12,
      category,
      search,
      minPrice,
      maxPrice,
      sort,
    }),
  ]);

  const categories =
    categoriesResult.status === 'fulfilled' ? categoriesResult.value : [];

  if (productsResult.status === 'rejected') {
    return (
      <main className="aevro-container min-h-screen py-12">
        <ErrorState
          title="Products unavailable"
          message="The product API could not be reached. Start the backend and check NEXT_PUBLIC_API_URL."
        />
      </main>
    );
  }

  const products = productsResult.value.data;
  const meta = productsResult.value.meta ?? {
    page,
    limit: 12,
    total: products.length,
    totalPages: products.length > 0 ? 1 : 0,
    hasNextPage: false,
    hasPreviousPage: false,
  };

  return (
    <main>
      <section className="border-b border-[#ddd4c8]">
        <div className="relative min-h-[360px] overflow-hidden lg:aspect-[2880/900] lg:min-h-0">
          <img
            src="/images/brand/plp-hero.webp"
            alt="AEVRO trouser collection"
            className="absolute inset-0 h-full w-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(251,247,240,0.95)_0%,rgba(251,247,240,0.86)_35%,rgba(251,247,240,0.18)_65%,rgba(251,247,240,0)_100%)]" />
          <div className="relative flex min-h-[360px] items-center px-6 py-14 sm:px-12 lg:min-h-full lg:px-20 xl:px-28">
            <div className="max-w-lg">
              <p className="text-xs font-semibold uppercase tracking-[0.08em]">
                Shop / Trousers
              </p>
              <h1 className="mt-6 text-5xl font-light uppercase leading-none md:text-7xl">
                Trousers
              </h1>
              <p className="mt-6 text-base leading-7 text-[#2f2a25]">
                Refined silhouettes. Timeless style. Explore our collection of
                trousers crafted for comfort, versatility, and effortless
                elegance.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="aevro-container grid gap-10 py-12 lg:grid-cols-[280px_1fr]">
        <aside className="border-[#ddd4c8] lg:border-r lg:pr-9">
          <div className="mb-7 flex items-center justify-between border-b border-[#ddd4c8] pb-5">
            <p className="text-xs font-semibold uppercase tracking-[0.08em]">
              Filter
            </p>
            <Link
              href="/products"
              className="text-xs uppercase tracking-[0.08em] underline-offset-4 hover:underline"
            >
              Clear all
            </Link>
          </div>
          <div className="space-y-7">
            <div className="border-b border-[#ddd4c8] pb-7">
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.08em]">
                Category
              </p>
              <div className="space-y-3 text-sm">
                <Link
                  href={buildProductsHref(params, { category: undefined, page: undefined })}
                  className={`block ${!category ? 'font-medium' : 'text-[#514c45]'}`}
                >
                  All products
                </Link>
                {categories.map((item) => (
                  <Link
                    key={item.id}
                    href={buildProductsHref(params, {
                      category: item.slug,
                      page: undefined,
                    })}
                    className={`block ${category === item.slug ? 'font-medium' : 'text-[#514c45]'}`}
                  >
                    {item.name}
                    {typeof item.activeProductCount === 'number'
                      ? ` (${item.activeProductCount})`
                      : ''}
                  </Link>
                ))}
              </div>
            </div>

            <div className="border-b border-[#ddd4c8] pb-7">
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.08em]">
                Color
              </p>
              <div className="space-y-3 text-sm">
                {[
                  ['Ivory', '#f4eadb'],
                  ['Stone', '#c8b9a8'],
                  ['Taupe', '#8d7968'],
                  ['Navy', '#17243a'],
                  ['Black', '#0f0f0f'],
                ].map(([name, hex]) => (
                  <div key={name} className="flex items-center gap-3 text-[#2f2a25]">
                    <span
                      className="h-5 w-5 rounded-full border border-[#111111]/30"
                      style={{ backgroundColor: hex }}
                    />
                    <span>{name}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-b border-[#ddd4c8] pb-7">
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.08em]">
                Size
              </p>
              <div className="grid grid-cols-5 gap-2">
                {['30', '32', '34', '36', '38'].map((size) => (
                  <span
                    key={size}
                    className="flex h-9 items-center justify-center rounded-[4px] border border-[#ddd4c8] text-sm"
                  >
                    {size}
                  </span>
                ))}
              </div>
            </div>

            <form className="space-y-7">
              {category && <input type="hidden" name="category" value={category} />}
              <div className="border-b border-[#ddd4c8] pb-7">
                <p className="mb-4 text-xs font-semibold uppercase tracking-[0.08em]">
                  Search
                </p>
                <input
                  name="search"
                  defaultValue={search}
                  placeholder="Search products"
                  className="h-11 w-full border border-[#ddd4c8] bg-transparent px-4 text-sm outline-none focus:border-[#111111]"
                />
              </div>
              <div className="border-b border-[#ddd4c8] pb-7">
                <p className="mb-4 text-xs font-semibold uppercase tracking-[0.08em]">
                  Price
                </p>
                <div className="grid gap-3">
                  <input
                    name="minPrice"
                    defaultValue={minPrice}
                    inputMode="numeric"
                    placeholder="Min price"
                    className="h-11 w-full border border-[#ddd4c8] bg-transparent px-4 text-sm outline-none focus:border-[#111111]"
                  />
                  <input
                    name="maxPrice"
                    defaultValue={maxPrice}
                    inputMode="numeric"
                    placeholder="Max price"
                    className="h-11 w-full border border-[#ddd4c8] bg-transparent px-4 text-sm outline-none focus:border-[#111111]"
                  />
                </div>
              </div>
              <button className="h-12 w-full bg-[#111111] px-5 text-sm font-medium uppercase tracking-[0.08em] text-[#fffaf3] hover:bg-[#2a2825]">
                Apply filters
              </button>
            </form>
          </div>
        </aside>

        <div>
          <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs font-semibold uppercase tracking-[0.08em]">
              {meta.total} products
            </p>
            <div className="flex flex-wrap items-center gap-4 text-xs font-semibold uppercase tracking-[0.08em]">
              <span>Sort by</span>
              <Link
                href={buildProductsHref(params, { sort: 'newest', page: undefined })}
                className={sort === 'newest' ? 'border-b border-[#111111]' : ''}
              >
                Featured
              </Link>
              <Link
                href={buildProductsHref(params, { sort: 'price_asc', page: undefined })}
                className={sort === 'price_asc' ? 'border-b border-[#111111]' : ''}
              >
                Price low
              </Link>
              <Link
                href={buildProductsHref(params, { sort: 'price_desc', page: undefined })}
                className={sort === 'price_desc' ? 'border-b border-[#111111]' : ''}
              >
                Price high
              </Link>
            </div>
          </div>

          {products.length === 0 ? (
            <EmptyState
              title="No products found"
              message="Try a different category, search term, or sorting option."
            />
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} compact />
              ))}
            </div>
          )}

          <div className="mt-12 flex items-center justify-center gap-8 text-sm">
            {meta.hasPreviousPage ? (
              <Link
                href={buildProductsHref(params, { page: meta.page - 1 })}
                className="underline underline-offset-4"
              >
                Previous
              </Link>
            ) : (
              <span className="text-[#aaa39a]">Previous</span>
            )}
            <span className="font-medium">
              Page {meta.page} of {Math.max(meta.totalPages, 1)}
            </span>
            {meta.hasNextPage ? (
              <Link
                href={buildProductsHref(params, { page: meta.page + 1 })}
                className="underline underline-offset-4"
              >
                Next
              </Link>
            ) : (
              <span className="text-[#aaa39a]">Next</span>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
