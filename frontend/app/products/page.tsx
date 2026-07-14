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

function FilterControlIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      aria-hidden="true"
      className="h-5 w-5"
    >
      <path d="M4 7h16M4 17h16" />
      <circle cx="9" cy="7" r="2" fill="#fbf7f0" />
      <circle cx="15" cy="17" r="2" fill="#fbf7f0" />
    </svg>
  );
}

function SortControlIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="h-5 w-5"
    >
      <path d="M8 4v16M5 7l3-3 3 3M16 20V4M13 17l3 3 3-3" />
    </svg>
  );
}

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
  const color = getStringParam(params, 'color');
  const size = getStringParam(params, 'size');
  const search = getStringParam(params, 'search');
  const activeSearch = search?.trim();
  const minPrice = getNumberParam(params, 'minPrice');
  const maxPrice = getNumberParam(params, 'maxPrice');
  const sort = (getStringParam(params, 'sort') as ProductSort | undefined) ?? 'newest';
  const hasActiveFilters = Boolean(
    category || activeSearch || color || size || minPrice || maxPrice || sort !== 'newest',
  );

  const [categoriesResult, productsResult] = await Promise.allSettled([
    getCategories({ includeEmpty: true }),
    getProducts({
      page,
      limit: 12,
      category,
      color,
      size,
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
      <section className="border-b border-[#ddd4c8] lg:hidden">
        <div className="relative aspect-[1.57/1] overflow-hidden bg-[#d8bea0]">
          <Image
            src="/images/brand/plp-hero-2029-sharp.webp"
            alt="AEVRO trouser collection"
            fill
            priority
            unoptimized
            quality={100}
            sizes="100vw"
            className="object-cover object-right"
          />
        </div>
        <div className="bg-[#fbf7f0] px-5 py-7 min-[390px]:px-6 min-[430px]:py-8">
          <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#171717]">
            Home / <span className="font-bold">Trousers</span>
          </p>
          <h1 className="mt-3 text-[2rem] font-light uppercase leading-none text-[#181818] min-[390px]:text-[2.15rem]">
            Trousers
          </h1>
          <p className="mt-4 max-w-[22rem] text-[12px] leading-[1.65] text-[#3f3933] min-[390px]:text-[13px]">
            Refined silhouettes. Timeless style. Explore our collection of
            trousers crafted for comfort, versatility, and effortless elegance.
          </p>
        </div>
      </section>

      <section className="hidden border-b border-[#ddd4c8] lg:block">
        <div className="relative aspect-[2029/775] min-h-[360px] overflow-hidden bg-[#d8bea0]">
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
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(226,196,158,0.38)_0%,rgba(226,196,158,0.18)_34%,rgba(226,196,158,0.03)_56%,rgba(226,196,158,0)_100%)]" />
          <div className="relative flex h-full items-center px-20 xl:px-28">
            <div className="w-full max-w-[430px] rounded-[2px] bg-[#f4dcc0]/12 p-0">
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#171717]">
                Home / <span className="font-bold">Trousers</span>
              </p>
              <h1 className="mt-5 max-w-full text-[5.7rem] font-light uppercase leading-[0.94] text-[#181818] xl:text-[6rem]">
                Trousers
              </h1>
              <p className="mt-4 max-w-[430px] text-base leading-7 text-[#27221e]">
                Refined silhouettes. Timeless style. Explore our collection of
                trousers crafted for comfort, versatility, and effortless
                elegance.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="aevro-container grid gap-4 pb-28 pt-0 sm:gap-6 sm:pb-32 lg:grid-cols-[260px_1fr] lg:gap-10 lg:py-10 xl:grid-cols-[280px_1fr]">
        <div className="sticky top-[72px] z-20 -mx-4 bg-[#fbf7f0]/96 px-4 backdrop-blur sm:top-[78px] lg:hidden">
          <div className="grid grid-cols-3 divide-x divide-[#ddd4c8] border-b border-[#ddd4c8]">
            <details className="group min-w-0">
              <summary className="flex h-14 cursor-pointer list-none items-center justify-center gap-2 text-[0.7rem] font-medium uppercase tracking-[0.06em]">
                <FilterControlIcon />
                Filter
              </summary>
              <div className="fixed inset-x-0 bottom-0 z-50 max-h-[82vh] overflow-y-auto rounded-t-[18px] border-t border-[#ddd4c8] bg-[#fbf7f0] p-4 pb-32 shadow-[0_-22px_70px_rgba(49,37,26,0.18)]">
                <div className="mb-5 flex items-center justify-between gap-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em]">Filters</p>
                  <Link href="/products" className="text-xs uppercase tracking-[0.12em] underline underline-offset-4">
                    Clear all
                  </Link>
                </div>
                <div className="space-y-6">
                  <div className="border-b border-[#ddd4c8] pb-5">
                    <p className="mb-3 text-xs font-semibold uppercase tracking-[0.12em]">
                      Category
                    </p>
                    <div className="grid gap-2 text-sm">
                      <Link
                        href={buildProductsHref(params, { category: undefined, page: undefined })}
                        className={`flex min-h-10 items-center justify-between border border-[#ddd4c8] px-3 ${!category ? 'bg-[#eee5da] font-medium text-[#111111]' : 'bg-[#fffaf3] text-[#514c45]'}`}
                      >
                        All products
                      </Link>
                      {categories.map((item) => (
                        <Link
                          key={item.id}
                          href={buildProductsHref(params, { category: item.slug, page: undefined })}
                          className={`flex min-h-10 items-center justify-between border border-[#ddd4c8] px-3 ${category === item.slug ? 'bg-[#eee5da] font-medium text-[#111111]' : 'bg-[#fffaf3] text-[#514c45]'}`}
                        >
                          <span>{item.name}</span>
                          {typeof item.activeProductCount === 'number' ? (
                            <span>{item.activeProductCount}</span>
                          ) : null}
                        </Link>
                      ))}
                    </div>
                  </div>

                  <div className="border-b border-[#ddd4c8] pb-5">
                    <p className="mb-3 text-xs font-semibold uppercase tracking-[0.12em]">
                      Color
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-sm">
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
                            className={`flex min-h-10 items-center gap-2 border border-[#ddd4c8] px-3 ${isActive ? 'bg-[#eee5da] font-medium text-[#111111]' : 'bg-[#fffaf3] text-[#514c45]'}`}
                          >
                            <span
                              className="h-4 w-4 rounded-full border border-[#111111]/30"
                              style={{ backgroundColor: hex }}
                            />
                            <span>{name}</span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>

                  <div className="border-b border-[#ddd4c8] pb-5">
                    <p className="mb-3 text-xs font-semibold uppercase tracking-[0.12em]">
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
                            className={`flex h-10 items-center justify-center border text-sm ${isActive ? 'border-[#111111] bg-[#eee5da]' : 'border-[#ddd4c8] bg-[#fffaf3]'}`}
                          >
                            {sizeOption}
                          </Link>
                        );
                      })}
                    </div>
                  </div>

                  <form className="grid gap-4">
                    {category && <input type="hidden" name="category" value={category} />}
                    {color && <input type="hidden" name="color" value={color} />}
                    {size && <input type="hidden" name="size" value={size} />}
                    {sort && sort !== 'newest' && <input type="hidden" name="sort" value={sort} />}
                    <label>
                      <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em]">
                        Search
                      </span>
                      <input
                        name="search"
                        defaultValue={search}
                        placeholder="Search products"
                        className="h-11 w-full border border-[#ddd4c8] bg-[#fffaf3] px-4 text-sm outline-none focus:border-[#111111]"
                      />
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        name="minPrice"
                        defaultValue={minPrice}
                        inputMode="numeric"
                        placeholder="Min price"
                        className="h-11 w-full border border-[#ddd4c8] bg-[#fffaf3] px-4 text-sm outline-none focus:border-[#111111]"
                      />
                      <input
                        name="maxPrice"
                        defaultValue={maxPrice}
                        inputMode="numeric"
                        placeholder="Max price"
                        className="h-11 w-full border border-[#ddd4c8] bg-[#fffaf3] px-4 text-sm outline-none focus:border-[#111111]"
                      />
                    </div>
                    <button className="h-12 w-full bg-[#111111] px-5 text-xs font-medium uppercase tracking-[0.12em] text-[#fffaf3]">
                      Apply Filters
                    </button>
                    <Link
                      href={buildProductsHref(params, {})}
                      className="flex h-12 w-full items-center justify-center border border-[#ddd4c8] bg-[#fffaf3] text-xs font-medium uppercase tracking-[0.12em]"
                    >
                      Close
                    </Link>
                  </form>
                </div>
              </div>
            </details>

            <details className="group min-w-0">
              <summary className="flex h-14 cursor-pointer list-none items-center justify-center gap-2 text-[0.7rem] font-medium uppercase tracking-[0.06em]">
                <SortControlIcon />
                Sort
              </summary>
              <div className="absolute left-4 right-4 top-[calc(100%+8px)] z-40 grid rounded-[10px] border border-[#ddd4c8] bg-[#fffaf3] p-2 shadow-[0_16px_45px_rgba(49,37,26,0.12)]">
                <Link href={buildProductsHref(params, { sort: 'newest', page: undefined })} className={`px-4 py-3 text-xs uppercase tracking-[0.12em] ${sort === 'newest' ? 'bg-[#eee5da]' : ''}`}>
                  Featured
                </Link>
                <Link href={buildProductsHref(params, { sort: 'price_asc', page: undefined })} className={`px-4 py-3 text-xs uppercase tracking-[0.12em] ${sort === 'price_asc' ? 'bg-[#eee5da]' : ''}`}>
                  Price low
                </Link>
                <Link href={buildProductsHref(params, { sort: 'price_desc', page: undefined })} className={`px-4 py-3 text-xs uppercase tracking-[0.12em] ${sort === 'price_desc' ? 'bg-[#eee5da]' : ''}`}>
                  Price high
                </Link>
              </div>
            </details>

            <Link
              href="/products"
              className={`flex h-14 items-center justify-center text-[0.7rem] font-medium uppercase tracking-[0.06em] ${hasActiveFilters ? 'text-[#111111]' : 'text-[#aaa39a]'}`}
            >
              Clear
            </Link>
          </div>
        </div>

        <aside className="hidden max-h-[58vh] overflow-y-auto rounded-[10px] border border-[#ddd4c8] bg-[#fffaf3]/60 p-4 shadow-[0_14px_40px_rgba(49,37,26,0.04)] lg:block lg:max-h-none lg:overflow-visible lg:rounded-none lg:border-0 lg:border-r lg:bg-transparent lg:p-0 lg:pr-8 lg:shadow-none xl:pr-10">
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

            <form className="space-y-7">
              {category && <input type="hidden" name="category" value={category} />}
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
          <div className="mb-6 hidden flex-col gap-3 sm:flex-row sm:items-center sm:justify-between lg:flex lg:pt-0">
            <p className="text-xs font-semibold uppercase tracking-[0.08em]">
              {activeSearch ? `Showing results for “${activeSearch}”` : `${meta.total} products`}
            </p>
            <div className="hidden max-w-full flex-wrap items-center gap-2 text-[0.68rem] font-semibold uppercase tracking-[0.08em] sm:gap-x-4 sm:gap-y-2 sm:text-xs lg:flex">
              {activeSearch ? (
                <Link
                  href={buildProductsHref(params, { search: undefined, page: undefined })}
                  className="border-b border-[#111111] pb-1"
                >
                  Clear search
                </Link>
              ) : null}
              <span className="w-full text-[#77716a] sm:w-auto">Sort by</span>
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
            <div className="grid grid-cols-2 gap-2.5 pt-6 min-[390px]:gap-3 sm:gap-5 md:grid-cols-3 lg:pt-0 xl:grid-cols-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} compact shopMobile />
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
