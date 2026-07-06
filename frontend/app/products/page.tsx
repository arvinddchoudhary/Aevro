import Link from 'next/link';
import type { Metadata } from 'next';
import Image from 'next/image';
import { ProductCard } from '../../components/products/ProductCard';
import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorState } from '../../components/ui/ErrorState';
import { getCategories, getProducts } from '../../lib/api/catalog';
import { pageMetadata } from '../../lib/seo';
import type { ProductSort } from '../../types/catalog';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = pageMetadata({
  title: 'Shop Refined Trousers and Essentials',
  description:
    'Explore AEVRO trousers and modern essentials designed with refined silhouettes, clean tailoring, and everyday comfort.',
  path: '/products',
  image: '/images/brand/plp-hero-2029-sharp.webp',
});

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
  const activeSearch = search?.trim();
  const color = getStringParam(params, 'color');
  const size = getStringParam(params, 'size');
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
      color,
      size,
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
        <div className="relative aspect-[2029/775] min-h-[300px] overflow-hidden bg-[#d8bea0]">
          <Image
            src="/images/brand/plp-hero-2029-sharp.webp"
            alt="AEVRO trouser collection"
            fill
            priority
            unoptimized
            quality={100}
            sizes="100vw"
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(226,196,158,0.28)_0%,rgba(226,196,158,0.16)_29%,rgba(226,196,158,0.03)_48%,rgba(226,196,158,0)_100%)]" />
          <div className="relative flex h-full items-center px-6 sm:px-12 lg:px-20 xl:px-28">
            <div className="max-w-[560px]">
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.03em] text-[#171717] sm:text-xs">
                Home / <span className="font-bold">Trousers</span>
              </p>
              <h1 className="mt-7 text-[3.4rem] font-medium uppercase leading-[0.92] tracking-[-0.04em] text-[#181818] sm:text-[4.4rem] md:text-[5.15rem] lg:text-[5.7rem] xl:text-[6rem]">
                Trousers
              </h1>
              <p className="mt-6 max-w-[500px] text-[0.95rem] leading-7 text-[#27221e] sm:text-base">
                Refined silhouettes. Timeless style. Explore our collection of
                trousers crafted for comfort, versatility, and effortless
                elegance.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="aevro-container grid gap-8 py-8 sm:py-10 lg:grid-cols-[260px_1fr] lg:gap-10 xl:grid-cols-[280px_1fr]">
        <aside className="rounded-[6px] border border-[#ddd4c8] p-4 lg:rounded-none lg:border-0 lg:border-r lg:p-0 lg:pr-8 xl:pr-10">
          <div className="mb-6 flex items-center justify-between border-b border-[#ddd4c8] pb-5">
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
          <div className="space-y-6 lg:space-y-7">
            <div className="border-b border-[#ddd4c8] pb-6 lg:pb-7">
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.08em]">
                Category
              </p>
              <div className="space-y-3 text-sm">
                <Link
                  href={buildProductsHref(params, { category: undefined, page: undefined })}
                  className={`block underline-offset-4 hover:underline ${!category ? 'font-medium text-[#111111]' : 'text-[#514c45]'}`}
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
                    className={`block underline-offset-4 hover:underline ${category === item.slug ? 'font-medium text-[#111111]' : 'text-[#514c45]'}`}
                  >
                    {item.name}
                    {typeof item.activeProductCount === 'number'
                      ? ` (${item.activeProductCount})`
                      : ''}
                  </Link>
                ))}
              </div>
            </div>

            <div className="border-b border-[#ddd4c8] pb-6 lg:pb-7">
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.08em]">
                Color
              </p>
              <div className="space-y-3 text-sm">
                {[
                  ['Ivory', 'ivory', '#f4eadb'],
                  ['Stone', 'stone', '#c8b9a8'],
                  ['Taupe', 'taupe', '#8d7968'],
                  ['Navy', 'navy', '#17243a'],
                  ['Black', 'black', '#0f0f0f'],
                ].map(([name, slug, hex]) => {
                  const isActive = color === slug;

                  return (
                    <Link
                      key={name}
                      href={buildProductsHref(params, {
                        color: isActive ? undefined : slug,
                        page: undefined,
                      })}
                      className={`flex items-center gap-3 ${isActive ? 'font-medium text-[#111111]' : 'text-[#514c45] hover:text-[#111111]'}`}
                    >
                      <span
                        className={`h-5 w-5 rounded-full border ${isActive ? 'border-[#111111] ring-1 ring-[#111111] ring-offset-1 ring-offset-[#fbf7f0]' : 'border-[#111111]/30'}`}
                        style={{ backgroundColor: hex }}
                      />
                      <span>{name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="border-b border-[#ddd4c8] pb-6 lg:pb-7">
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.08em]">
                Size
              </p>
              <div className="grid grid-cols-5 gap-2">
                {['30', '32', '34', '36', '38'].map((sizeOption) => {
                  const isActive = size === sizeOption;

                  return (
                    <Link
                      key={sizeOption}
                      href={buildProductsHref(params, {
                        size: isActive ? undefined : sizeOption,
                        page: undefined,
                      })}
                      className={`flex h-9 items-center justify-center rounded-[4px] border text-sm transition ${isActive ? 'border-[#111111] bg-[#fffaf3] shadow-[inset_0_0_0_1px_#111111]' : 'border-[#ddd4c8] text-[#514c45] hover:border-[#111111] hover:text-[#111111]'}`}
                    >
                      {sizeOption}
                    </Link>
                  );
                })}
              </div>
            </div>

            <form className="space-y-7">
              {category && <input type="hidden" name="category" value={category} />}
              {color && <input type="hidden" name="color" value={color} />}
              {size && <input type="hidden" name="size" value={size} />}
              {sort && sort !== 'newest' && <input type="hidden" name="sort" value={sort} />}
              <div className="border-b border-[#ddd4c8] pb-6 lg:pb-7">
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
              <div className="border-b border-[#ddd4c8] pb-6 lg:pb-7">
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
              <button
                className="h-12 w-full bg-[#111111] px-5 text-sm font-medium uppercase tracking-[0.08em] text-[#fffaf3] hover:bg-[#2a2825]"
                aria-label="Apply product filters"
              >
                Apply filters
              </button>
            </form>
          </div>
        </aside>

        <div>
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs font-semibold uppercase tracking-[0.08em]">
              {activeSearch ? `Showing results for “${activeSearch}”` : `${meta.total} products`}
            </p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-semibold uppercase tracking-[0.08em]">
              {activeSearch ? (
                <Link
                  href={buildProductsHref(params, { search: undefined, page: undefined })}
                  className="border-b border-[#111111] pb-1"
                >
                  Clear search
                </Link>
              ) : null}
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
              title={activeSearch ? 'No exact matches found' : 'No products found'}
              message={
                activeSearch
                  ? 'Try trousers, wide leg trousers, black trousers, or formal trousers.'
                  : 'Try a different category, search term, or sorting option.'
              }
            />
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 xl:grid-cols-4">
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
