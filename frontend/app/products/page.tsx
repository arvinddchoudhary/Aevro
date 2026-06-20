import Link from 'next/link';
import { CategoryPills } from '../../components/products/CategoryPills';
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
      <main className="mx-auto min-h-screen max-w-6xl px-5 py-12 sm:px-8">
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
  const sortOptions: { label: string; value: ProductSort }[] = [
    { label: 'Newest', value: 'newest' },
    { label: 'Price low to high', value: 'price_asc' },
    { label: 'Price high to low', value: 'price_desc' },
  ];
  const hasActiveFilters = Boolean(category || search || minPrice || maxPrice);

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-5 py-12 sm:px-8">
      <div className="mb-10">
        <p className="mb-3 text-xs uppercase tracking-[0.22em] text-[#777777]">
          Shop
        </p>
        <h1 className="text-4xl font-light md:text-5xl">Products</h1>
      </div>

      <div className="mb-8 flex flex-col gap-5 border-y border-[#e5e5e5] py-5">
        <CategoryPills
          categories={categories}
          activeCategory={category}
          getHref={(nextCategory) =>
            buildProductsHref(params, {
              category: nextCategory,
              page: undefined,
            })
          }
        />

        <form className="grid gap-3 lg:grid-cols-[minmax(220px,1fr)_130px_130px_190px_auto] lg:items-end">
            {category && <input type="hidden" name="category" value={category} />}
          <label className="block">
            <span className="mb-2 block text-xs uppercase tracking-[0.16em] text-[#777777]">
              Search
            </span>
            <input
                name="search"
                defaultValue={search}
                placeholder="Search products"
                className="h-11 w-full border border-[#d9d9d9] px-4 text-sm outline-none focus:border-[#111111]"
              />
          </label>
          <label className="block">
            <span className="mb-2 block text-xs uppercase tracking-[0.16em] text-[#777777]">
              Min price
            </span>
            <input
              name="minPrice"
              defaultValue={minPrice}
              inputMode="numeric"
              placeholder="100000"
              className="h-11 w-full border border-[#d9d9d9] px-4 text-sm outline-none focus:border-[#111111]"
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-xs uppercase tracking-[0.16em] text-[#777777]">
              Max price
            </span>
            <input
              name="maxPrice"
              defaultValue={maxPrice}
              inputMode="numeric"
              placeholder="250000"
              className="h-11 w-full border border-[#d9d9d9] px-4 text-sm outline-none focus:border-[#111111]"
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-xs uppercase tracking-[0.16em] text-[#777777]">
              Sort
            </span>
            <select
              name="sort"
              defaultValue={sort}
              className="h-11 w-full border border-[#d9d9d9] bg-white px-4 text-sm outline-none focus:border-[#111111]"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <div className="flex gap-2">
            <button className="h-11 min-w-28 border border-[#111111] bg-white px-5 text-sm font-medium uppercase tracking-[0.08em] text-[#111111] hover:bg-[#111111] hover:text-white">
              Apply
            </button>
            {hasActiveFilters && (
              <Link
                href="/products"
                className="inline-flex h-11 min-w-24 items-center justify-center border border-[#d9d9d9] px-5 text-sm font-medium uppercase tracking-[0.08em] text-[#111111] hover:border-[#111111]"
              >
                Clear
              </Link>
            )}
          </div>
        </form>
      </div>

      {products.length === 0 ? (
        <EmptyState
          title="No products found"
          message="Try a different category, search term, or sorting option."
        />
      ) : (
        <>
          <div className="mb-5 text-sm text-[#666666]">
            Showing {products.length} of {meta.total} products
          </div>
          <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </>
      )}

      <div className="mt-10 flex items-center justify-between border-t border-[#e5e5e5] pt-6 text-sm">
        {meta.hasPreviousPage ? (
          <Link
            href={buildProductsHref(params, { page: meta.page - 1 })}
            className="underline underline-offset-4"
          >
            Previous
          </Link>
        ) : (
          <span className="text-[#aaaaaa]">Previous</span>
        )}
        <span>
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
          <span className="text-[#aaaaaa]">Next</span>
        )}
      </div>
    </main>
  );
}
