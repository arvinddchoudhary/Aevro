'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { getAdminProducts } from '../../../lib/api/admin-products';
import type { AdminProduct } from '../../../types/admin/products';
import { EmptyState } from '../../ui/EmptyState';
import { ErrorState } from '../../ui/ErrorState';
import { AdminIcon } from '../AdminIcons';

type CategoryUploadSummary = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  products: AdminProduct[];
  imageCount: number;
  variantCount: number;
  coverImage?: string;
};

function getProductImageCount(product: AdminProduct) {
  return product.variants.reduce(
    (total, variant) => total + variant.images.length,
    0,
  );
}

function getProductCover(product: AdminProduct) {
  return (
    product.primaryImage?.url ??
    product.variants.find((variant) => variant.images.length > 0)?.images[0]?.url
  );
}

function buildCategorySummaries(products: AdminProduct[]) {
  const categories = new Map<string, CategoryUploadSummary>();

  products.forEach((product) => {
    const category = product.category;
    const key = category?.slug ?? 'uncategorized';
    const current =
      categories.get(key) ??
      {
        id: category?.id ?? 'uncategorized',
        name: category?.name ?? 'Uncategorized',
        slug: key,
        description: category?.description ?? null,
        products: [],
        imageCount: 0,
        variantCount: 0,
        coverImage: undefined,
      };

    current.products.push(product);
    current.imageCount += getProductImageCount(product);
    current.variantCount += product.variants.length;
    current.coverImage = current.coverImage ?? getProductCover(product);
    categories.set(key, current);
  });

  return Array.from(categories.values()).sort((a, b) =>
    a.name.localeCompare(b.name),
  );
}

export function AdminUploadsPageContent() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProducts() {
      try {
        setIsLoading(true);
        setError(null);
        setProducts(await getAdminProducts());
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Unable to load uploads.');
      } finally {
        setIsLoading(false);
      }
    }

    void loadProducts();
  }, []);

  const categories = useMemo(() => buildCategorySummaries(products), [products]);
  const totalImages = categories.reduce(
    (total, category) => total + category.imageCount,
    0,
  );

  return (
    <section>
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#a56f3c]">
          Media library
        </p>
        <h1 className="mt-4 font-serif text-5xl font-light leading-none text-[#111111] sm:text-6xl">
          Uploads
        </h1>
        <p className="mt-6 max-w-2xl text-base leading-8 text-[#625a51]">
          Browse product media by category, then open a category to review all
          products, variants, and uploaded images.
        </p>
      </div>

      {isLoading && <EmptyState title="Loading uploads" message="Fetching product media." />}
      {error && <ErrorState title="Uploads unavailable" message={error} />}

      {!isLoading && !error && categories.length === 0 && (
        <div className="rounded-[8px] border border-[#ddd4c8] bg-[#fffaf3]/84 p-8 text-center">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#eee7dd]">
            <AdminIcon name="upload" className="h-7 w-7" />
          </span>
          <h2 className="mt-5 font-serif text-2xl text-[#111111]">
            No product uploads yet.
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#625a51]">
            Upload product images from the product creation or edit flow.
          </p>
          <Link
            href="/admin/products/new"
            className="mt-6 inline-flex h-11 items-center justify-center bg-[#111111] px-6 text-sm font-medium uppercase tracking-[0.08em] text-[#fffaf3]"
            style={{ color: '#fffaf3' }}
          >
            New Product
          </Link>
        </div>
      )}

      {!isLoading && !error && categories.length > 0 && (
        <>
          <div className="mb-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-[8px] border border-[#ddd4c8] bg-[#fffaf3]/84 p-5">
              <p className="text-xs uppercase tracking-[0.18em] text-[#77716a]">
                Categories
              </p>
              <p className="mt-3 font-serif text-3xl text-[#111111]">
                {categories.length}
              </p>
            </div>
            <div className="rounded-[8px] border border-[#ddd4c8] bg-[#fffaf3]/84 p-5">
              <p className="text-xs uppercase tracking-[0.18em] text-[#77716a]">
                Products
              </p>
              <p className="mt-3 font-serif text-3xl text-[#111111]">
                {products.length}
              </p>
            </div>
            <div className="rounded-[8px] border border-[#ddd4c8] bg-[#fffaf3]/84 p-5">
              <p className="text-xs uppercase tracking-[0.18em] text-[#77716a]">
                Images
              </p>
              <p className="mt-3 font-serif text-3xl text-[#111111]">
                {totalImages}
              </p>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {categories.map((category) => (
              <Link
                key={category.slug}
                href={`/admin/uploads/${category.slug}`}
                className="group overflow-hidden rounded-[8px] border border-[#ddd4c8] bg-[#fffaf3]/84 shadow-[0_18px_70px_rgba(44,34,24,0.025)] transition hover:border-[#c8bcae]"
              >
                <span className="block aspect-[16/10] overflow-hidden bg-[#f4eee5]">
                  {category.coverImage ? (
                    <img
                      src={category.coverImage}
                      alt={category.name}
                      className="h-full w-full object-cover transition group-hover:scale-[1.02]"
                    />
                  ) : (
                    <span className="flex h-full items-center justify-center text-[#c8bcae]">
                      <AdminIcon name="upload" className="h-12 w-12" />
                    </span>
                  )}
                </span>
                <span className="block p-5">
                  <span className="block text-xs font-semibold uppercase tracking-[0.24em] text-[#a56f3c]">
                    Category
                  </span>
                  <span className="mt-3 block font-serif text-3xl text-[#111111]">
                    {category.name}
                  </span>
                  <span className="mt-3 block text-sm leading-6 text-[#625a51]">
                    {category.products.length} products · {category.variantCount} variants ·{' '}
                    {category.imageCount} images
                  </span>
                  <span className="mt-5 inline-flex items-center gap-2 text-sm text-[#111111]">
                    View upload details
                    <AdminIcon name="arrow" className="h-4 w-4 text-[#a56f3c]" />
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </>
      )}
    </section>
  );
}

export { buildCategorySummaries, getProductCover, getProductImageCount };
