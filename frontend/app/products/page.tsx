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

export default async function ProductsPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const params = (await searchParams) ?? {};
  const page = Number(getStringParam(params, 'page') ?? 1);
  const category = getStringParam(params, 'category');
  const search = getStringParam(params, 'search');
  const sort = (getStringParam(params, 'sort') as ProductSort | undefined) ?? 'newest';

  const [categoriesResult, productsResult] = await Promise.allSettled([
    getCategories({ includeEmpty: true }),
    getProducts({
      page,
      limit: 12,
      category,
      search,
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

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-5 py-12 sm:px-8">
      <div className="mb-10">
        <p className="mb-3 text-xs uppercase tracking-[0.22em] text-[#777777]">
          Shop
        </p>
        <h1 className="text-4xl font-light md:text-5xl">Products</h1>
      </div>

      <div className="mb-8 flex flex-col gap-5 border-y border-[#e5e5e5] py-5">
        <CategoryPills categories={categories} activeCategory={category} />

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <form className="flex w-full max-w-md gap-2">
            {category && <input type="hidden" name="category" value={category} />}
            {sort && <input type="hidden" name="sort" value={sort} />}
            <input
              name="search"
              defaultValue={search}
              placeholder="Search products"
              className="h-11 flex-1 border border-[#d9d9d9] px-4 text-sm outline-none focus:border-[#111111]"
            />
            <button className="h-11 bg-[#111111] px-5 text-xs uppercase tracking-[0.16em] text-white">
              Search
            </button>
          </form>

          <div className="flex gap-2 text-sm">
            <Link href="/products?sort=newest" className="underline-offset-4 hover:underline">
              Newest
            </Link>
            <span className="text-[#bbbbbb]">/</span>
            <Link href="/products?sort=price_asc" className="underline-offset-4 hover:underline">
              Price low
            </Link>
            <span className="text-[#bbbbbb]">/</span>
            <Link href="/products?sort=price_desc" className="underline-offset-4 hover:underline">
              Price high
            </Link>
          </div>
        </div>
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
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </>
      )}

      <div className="mt-10 flex items-center justify-between border-t border-[#e5e5e5] pt-6 text-sm">
        {meta.hasPreviousPage ? (
          <Link href={`/products?page=${meta.page - 1}`} className="underline underline-offset-4">
            Previous
          </Link>
        ) : (
          <span className="text-[#aaaaaa]">Previous</span>
        )}
        <span>
          Page {meta.page} of {Math.max(meta.totalPages, 1)}
        </span>
        {meta.hasNextPage ? (
          <Link href={`/products?page=${meta.page + 1}`} className="underline underline-offset-4">
            Next
          </Link>
        ) : (
          <span className="text-[#aaaaaa]">Next</span>
        )}
      </div>
    </main>
  );
}
