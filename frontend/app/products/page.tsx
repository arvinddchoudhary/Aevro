import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import { CatalogFilters } from '../../components/products/CatalogFilters';
import { ProductCard } from '../../components/products/ProductCard';
import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorState } from '../../components/ui/ErrorState';
import { getProducts } from '../../lib/api/catalog';
import { pageMetadata } from '../../lib/seo';
import type { ProductFacets, ProductSort } from '../../types/catalog';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = pageMetadata({
  title: 'Shop Refined Trousers and Essentials',
  description:
    'Explore AEVRO trousers and modern essentials designed with refined silhouettes, clean tailoring, and everyday comfort.',
  path: '/products',
  image: '/images/brand/Shop-Page-Hero.webp',
});

type SearchParams = Record<string, string | string[] | undefined>;

const allowedSorts: ProductSort[] = [
  'relevance',
  'featured',
  'newest',
  'price_asc',
  'price_desc',
];

function getStringParam(searchParams: SearchParams, key: string) {
  const value = searchParams[key];
  return Array.isArray(value) ? value[0] : value;
}

function getMultiParam(searchParams: SearchParams, key: string) {
  const value = searchParams[key];
  const values = Array.isArray(value) ? value : value ? [value] : [];

  return values
    .flatMap((item) => item.split(','))
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
}

function getNumberParam(searchParams: SearchParams, key: string) {
  const value = getStringParam(searchParams, key);
  const parsed = value ? Number(value) : undefined;

  if (parsed === undefined || !Number.isInteger(parsed) || parsed < 0) {
    return undefined;
  }

  return parsed;
}

function buildProductsHref(
  currentParams: SearchParams,
  updates: Record<string, string | number | boolean | undefined>,
) {
  const params = new URLSearchParams();

  Object.entries(currentParams).forEach(([key, value]) => {
    const values = Array.isArray(value) ? value : value ? [value] : [];
    const normalized = values.flatMap((item) => item.split(',')).filter(Boolean).join(',');

    if (normalized) params.set(key, normalized);
  });

  Object.entries(updates).forEach(([key, value]) => {
    if (value === undefined || value === '') params.delete(key);
    else params.set(key, String(value));
  });

  const query = params.toString();
  return query ? `/products?${query}` : '/products';
}

const emptyFacets: ProductFacets = {
  categories: [],
  colors: [],
  sizes: [],
  fits: [],
  styles: [],
  materials: [],
  priceRange: { min: null, max: null },
};

export default async function ProductsPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const params = (await searchParams) ?? {};
  const page = Math.max(getNumberParam(params, 'page') ?? 1, 1);
  const category = getMultiParam(params, 'category');
  const color = getMultiParam(params, 'color');
  const size = getMultiParam(params, 'size');
  const search = getStringParam(params, 'search')?.trim() || undefined;
  const minPrice = getNumberParam(params, 'minPrice');
  const maxPrice = getNumberParam(params, 'maxPrice');
  const inStock = getStringParam(params, 'inStock') === 'true';
  const requestedSort = getStringParam(params, 'sort') as ProductSort | undefined;
  const sort = allowedSorts.includes(requestedSort as ProductSort)
    ? requestedSort!
    : search
      ? 'relevance'
      : 'newest';

  const result = await getProducts({
    page,
    limit: 12,
    category,
    color,
    size,
    search,
    minPrice,
    maxPrice,
    inStock,
    sort,
  });
  const products = result.data;
  const meta = result.pagination ?? result.meta ?? {
    page,
    limit: 12,
    total: products.length,
    totalPages: products.length > 0 ? 1 : 0,
    hasNextPage: false,
    hasPreviousPage: false,
  };
  const facets = result.facets ?? emptyFacets;
  const current = {
    category,
    color,
    size,
    minPrice,
    maxPrice,
    inStock,
    sort,
    search,
  };

  return (
    <main>
      <section className="border-b border-[#ddd4c8] lg:hidden">
        <div className="relative h-[200px] overflow-hidden bg-[#d8bea0] min-[390px]:h-[220px]">
          <Image
            src="/images/brand/Shop-Page-Hero.webp"
            alt="AEVRO trouser collection"
            fill
            priority
            unoptimized
            sizes="100vw"
            className="object-contain object-right"
          />
        </div>
        <div className="bg-[#fbf7f0] px-5 py-7 min-[390px]:px-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.08em]">
            Home / <span className="font-bold">Trousers</span>
          </p>
          <h1 className="mt-3 text-[2rem] font-light uppercase leading-none min-[390px]:text-[2.15rem]">
            Trousers
          </h1>
          <p className="mt-4 max-w-[22rem] text-[12px] leading-[1.65] text-[#3f3933] min-[390px]:text-[13px]">
            Refined silhouettes. Timeless style. Explore our collection of trousers crafted for comfort, versatility, and effortless elegance.
          </p>
        </div>
      </section>

      <section className="hidden border-b border-[#ddd4c8] lg:block">
        <div className="relative aspect-[2880/786] overflow-hidden bg-[#fbf7f0]">
          <Image
            src="/images/brand/Shop-Page-Hero.webp"
            alt="AEVRO trouser collection"
            fill
            priority
            unoptimized
            sizes="100vw"
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(226,196,158,0.38)_0%,rgba(226,196,158,0.18)_34%,rgba(226,196,158,0.03)_56%,rgba(226,196,158,0)_100%)]" />
          <div className="relative flex h-full items-center px-20 xl:px-28">
            <div className="w-full max-w-[430px]">
              <p className="text-xs font-semibold uppercase tracking-[0.08em]">Home / <span className="font-bold">Trousers</span></p>
              <h1 className="mt-5 text-[5.7rem] font-light uppercase leading-[0.94] xl:text-[6rem]">Trousers</h1>
              <p className="mt-4 max-w-[430px] text-base leading-7 text-[#27221e]">Refined silhouettes. Timeless style. Explore our collection of trousers crafted for comfort, versatility, and effortless elegance.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="aevro-container grid gap-5 pb-28 pt-0 sm:gap-6 sm:pb-32 lg:grid-cols-[260px_1fr] lg:gap-10 lg:py-10 xl:grid-cols-[280px_1fr]">
        <CatalogFilters facets={facets} current={current} total={meta.total} />

        <div className="min-w-0">
          <div className="mb-6 hidden items-center justify-between gap-4 lg:flex">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.08em]">
                {search ? `Showing results for “${search}”` : `${meta.total} products`}
              </p>
              {search ? (
                <Link href={buildProductsHref(params, { search: undefined, page: undefined })} className="mt-2 inline-block text-xs uppercase tracking-[0.08em] underline underline-offset-4">Clear search</Link>
              ) : null}
            </div>
            <div className="flex items-center gap-4 text-xs font-semibold uppercase tracking-[0.08em]">
              <span className="text-[#77716a]">Sort by</span>
              {(['relevance', 'featured', 'newest', 'price_asc', 'price_desc'] as ProductSort[]).map((value) => (
                <Link key={value} href={buildProductsHref(params, { sort: value, page: undefined })} className={sort === value ? 'border-b border-[#111111]' : ''}>
                  {value === 'price_asc' ? 'Price low' : value === 'price_desc' ? 'Price high' : value}
                </Link>
              ))}
            </div>
          </div>

          <div className="mb-4 flex items-center justify-between lg:hidden">
            <p className="text-xs font-semibold uppercase tracking-[0.08em]">{search ? `Results for “${search}”` : `${meta.total} products`}</p>
            {search ? <Link href={buildProductsHref(params, { search: undefined, page: undefined })} className="text-xs uppercase tracking-[0.08em] underline underline-offset-4">Clear search</Link> : null}
          </div>

          {products.length === 0 ? (
            <EmptyState
              title={search ? 'No products match these filters' : 'No products found'}
              message="Try clearing a filter or searching for trousers, black trousers, or wide leg trousers."
            />
          ) : (
            <div className="grid grid-cols-2 gap-2.5 min-[390px]:gap-3 sm:gap-5 md:grid-cols-3 xl:grid-cols-4">
              {products.map((product) => <ProductCard key={product.id} product={product} compact shopMobile />)}
            </div>
          )}

          <div className="mt-12 flex items-center justify-center gap-8 text-sm">
            {meta.hasPreviousPage ? <Link href={buildProductsHref(params, { page: meta.page - 1 })} className="underline underline-offset-4">Previous</Link> : <span className="text-[#aaa39a]">Previous</span>}
            <span className="font-medium">Page {meta.page} of {Math.max(meta.totalPages, 1)}</span>
            {meta.hasNextPage ? <Link href={buildProductsHref(params, { page: meta.page + 1 })} className="underline underline-offset-4">Next</Link> : <span className="text-[#aaa39a]">Next</span>}
          </div>
        </div>
      </section>
    </main>
  );
}
