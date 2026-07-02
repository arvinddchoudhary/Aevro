'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { getAdminProducts } from '../../../lib/api/admin-products';
import type { AdminProduct } from '../../../types/admin/products';
import { EmptyState } from '../../ui/EmptyState';
import { ErrorState } from '../../ui/ErrorState';
import { AdminIcon } from '../AdminIcons';

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

  const uploads = useMemo(
    () =>
      products.flatMap((product) =>
        product.variants.flatMap((variant) =>
          variant.images.map((image) => ({
            ...image,
            productId: product.id,
            productName: product.name,
            variantName: [variant.colorName, variant.size].filter(Boolean).join(' / '),
          })),
        ),
      ),
    [products],
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
          Review Cloudinary-hosted product media already attached to catalog
          variants.
        </p>
      </div>

      {isLoading && <EmptyState title="Loading uploads" message="Fetching product media." />}
      {error && <ErrorState title="Uploads unavailable" message={error} />}

      {!isLoading && !error && uploads.length === 0 && (
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

      {!isLoading && !error && uploads.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          {uploads.map((upload) => (
            <Link
              key={upload.publicId ?? upload.url}
              href={`/admin/products/${upload.productId}/edit`}
              className="group rounded-[8px] border border-[#ddd4c8] bg-[#fffaf3]/84 p-3 shadow-[0_18px_70px_rgba(44,34,24,0.025)] transition hover:border-[#c8bcae]"
            >
              <span className="block aspect-[4/5] overflow-hidden bg-[#f4eee5]">
                <img
                  src={upload.url}
                  alt={upload.altText ?? upload.productName}
                  className="h-full w-full object-cover transition group-hover:scale-[1.02]"
                />
              </span>
              <span className="mt-4 block truncate text-sm font-medium text-[#111111]">
                {upload.productName}
              </span>
              <span className="mt-1 block truncate text-xs uppercase tracking-[0.14em] text-[#77716a]">
                {upload.variantName || 'Product media'}
              </span>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
