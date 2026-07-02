'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { getAdminProducts } from '../../../lib/api/admin-products';
import type { AdminProduct } from '../../../types/admin/products';
import { EmptyState } from '../../ui/EmptyState';
import { ErrorState } from '../../ui/ErrorState';
import { AdminIcon } from '../AdminIcons';
import { buildCategorySummaries, getProductImageCount } from './AdminUploadsPageContent';

export function AdminUploadCategoryPageContent({ slug }: { slug: string }) {
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
        setError(loadError instanceof Error ? loadError.message : 'Unable to load category uploads.');
      } finally {
        setIsLoading(false);
      }
    }

    void loadProducts();
  }, []);

  const category = useMemo(
    () => buildCategorySummaries(products).find((item) => item.slug === slug),
    [products, slug],
  );

  return (
    <section>
      <div className="mb-8">
        <Link
          href="/admin/uploads"
          className="mb-6 inline-flex items-center gap-2 text-sm text-[#625a51] hover:text-[#111111]"
        >
          <AdminIcon name="arrow" className="h-4 w-4 rotate-180" />
          Back to uploads
        </Link>
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#a56f3c]">
          Upload details
        </p>
        <h1 className="mt-4 font-serif text-5xl font-light leading-none text-[#111111] sm:text-6xl">
          {category?.name ?? 'Category'}
        </h1>
        <p className="mt-6 max-w-2xl text-base leading-8 text-[#625a51]">
          Review every product, variant, and uploaded image attached to this
          category.
        </p>
      </div>

      {isLoading && <EmptyState title="Loading uploads" message="Fetching category media." />}
      {error && <ErrorState title="Category unavailable" message={error} />}

      {!isLoading && !error && !category && (
        <ErrorState
          title="Category not found"
          message="No uploaded product media was found for this category."
        />
      )}

      {!isLoading && !error && category && (
        <div className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-[8px] border border-[#ddd4c8] bg-[#fffaf3]/84 p-5">
              <p className="text-xs uppercase tracking-[0.18em] text-[#77716a]">
                Products
              </p>
              <p className="mt-3 font-serif text-3xl text-[#111111]">
                {category.products.length}
              </p>
            </div>
            <div className="rounded-[8px] border border-[#ddd4c8] bg-[#fffaf3]/84 p-5">
              <p className="text-xs uppercase tracking-[0.18em] text-[#77716a]">
                Variants
              </p>
              <p className="mt-3 font-serif text-3xl text-[#111111]">
                {category.variantCount}
              </p>
            </div>
            <div className="rounded-[8px] border border-[#ddd4c8] bg-[#fffaf3]/84 p-5">
              <p className="text-xs uppercase tracking-[0.18em] text-[#77716a]">
                Images
              </p>
              <p className="mt-3 font-serif text-3xl text-[#111111]">
                {category.imageCount}
              </p>
            </div>
          </div>

          {category.products.map((product) => (
            <article
              key={product.id}
              className="rounded-[8px] border border-[#ddd4c8] bg-[#fffaf3]/84 p-5 shadow-[0_18px_70px_rgba(44,34,24,0.025)]"
            >
              <div className="flex flex-col gap-4 border-b border-[#e7ded2] pb-5 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-[#77716a]">
                    {product.slug}
                  </p>
                  <h2 className="mt-2 font-serif text-3xl text-[#111111]">
                    {product.name}
                  </h2>
                  <p className="mt-2 text-sm text-[#625a51]">
                    {product.variants.length} variants · {getProductImageCount(product)} images
                  </p>
                </div>
                <Link
                  href={`/admin/products/${product.id}/edit`}
                  className="inline-flex h-10 w-full cursor-pointer items-center justify-center gap-2 border border-[#111111] px-4 text-sm transition hover:bg-[#111111] hover:text-[#fffaf3] sm:w-auto"
                >
                  Edit product
                  <AdminIcon name="arrow" className="h-4 w-4" />
                </Link>
              </div>

              <div className="mt-5 space-y-5">
                {product.variants.map((variant) => (
                  <section key={variant.id}>
                    <div className="mb-3 flex flex-wrap items-center gap-3">
                      <span
                        className="h-7 w-7 rounded-full border border-[#ddd4c8]"
                        style={{ backgroundColor: variant.colorHex ?? '#fffaf3' }}
                      />
                      <p className="text-sm font-medium text-[#111111]">
                        {variant.colorName} / {variant.size}
                      </p>
                      <p className="text-sm text-[#625a51]">Stock {variant.stock}</p>
                      {variant.sku && (
                        <p className="text-xs uppercase tracking-[0.16em] text-[#77716a]">
                          {variant.sku}
                        </p>
                      )}
                    </div>

                    {variant.images.length > 0 ? (
                      <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5">
                        {variant.images.map((image) => (
                          <a
                            key={image.publicId ?? image.url}
                            href={image.url}
                            target="_blank"
                            rel="noreferrer"
                            className="group overflow-hidden rounded-[6px] border border-[#e1d8cc] bg-[#fffdf8]"
                          >
                            <span className="block aspect-[4/5] overflow-hidden bg-[#f4eee5]">
                              <img
                                src={image.url}
                                alt={image.altText ?? product.name}
                                className="h-full w-full object-cover transition group-hover:scale-[1.02]"
                              />
                            </span>
                            <span className="block truncate px-3 py-3 text-xs uppercase tracking-[0.14em] text-[#77716a]">
                              {image.isPrimary ? 'Primary image' : 'Product image'}
                            </span>
                          </a>
                        ))}
                      </div>
                    ) : (
                      <p className="rounded-[6px] border border-[#e1d8cc] bg-[#fffdf8] p-4 text-sm text-[#625a51]">
                        No images uploaded for this variant.
                      </p>
                    )}
                  </section>
                ))}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
