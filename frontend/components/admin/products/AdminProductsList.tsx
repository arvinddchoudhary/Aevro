'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getAdminProducts } from '../../../lib/api/admin-products';
import { formatPrice } from '../../../lib/format';
import type { AdminProduct } from '../../../types/admin/products';
import { EmptyState } from '../../ui/EmptyState';
import { ErrorState } from '../../ui/ErrorState';

export function AdminProductsList() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProducts() {
      try {
        setProducts(await getAdminProducts());
      } catch (loadError) {
        setError(
          loadError instanceof Error ? loadError.message : 'Unable to load products.',
        );
      } finally {
        setIsLoading(false);
      }
    }

    void loadProducts();
  }, []);

  if (isLoading) {
    return <EmptyState title="Loading products" message="Fetching admin catalog." />;
  }

  if (error) {
    return <ErrorState title="Products unavailable" message={error} />;
  }

  if (products.length === 0) {
    return (
      <EmptyState
        title="No products yet"
        message="Create the first AEVRO product to start building the catalog."
      />
    );
  }

  return (
    <div className="space-y-4">
      {products.map((product) => {
        const lowStockVariants = product.variants.filter((variant) => variant.lowStock);
        const outOfStockVariants = product.variants.filter((variant) => variant.stock <= 0);

        return (
          <article
            key={product.id}
            className="grid gap-5 border border-[#e5e5e5] bg-white p-5 transition hover:border-[#111111] md:grid-cols-[96px_1fr_auto]"
          >
            <div className="aspect-[3/4] overflow-hidden bg-[#f5f5f5]">
              {product.primaryImage ? (
                <img
                  src={product.primaryImage.url}
                  alt={product.primaryImage.altText ?? product.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-xs uppercase tracking-[0.18em] text-[#777777]">
                  AEVRO
                </div>
              )}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <p className="text-xs uppercase tracking-[0.18em] text-[#777777]">
                  {product.category?.name ?? 'Uncategorised'}
                </p>
                <span className="border border-[#d9d9d9] px-3 py-1 text-xs uppercase tracking-[0.16em] text-[#555555]">
                  {product.status}
                </span>
              </div>
              <p className="mt-3 text-lg">{product.name}</p>
              <p className="mt-2 text-sm text-[#555555]">
                {product.variants.length} variant{product.variants.length === 1 ? '' : 's'} / Stock {product.stock}
              </p>
              {(lowStockVariants.length > 0 || outOfStockVariants.length > 0) && (
                <p className="mt-2 text-sm text-[#8a1f1f]">
                  {outOfStockVariants.length > 0
                    ? `${outOfStockVariants.length} variant${outOfStockVariants.length === 1 ? '' : 's'} out of stock`
                    : `${lowStockVariants.length} low-stock variant${lowStockVariants.length === 1 ? '' : 's'}`}
                </p>
              )}
              <p className="mt-2 text-xs uppercase tracking-[0.16em] text-[#777777]">
                Created {new Date(product.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div className="flex flex-col items-start gap-4 text-left md:items-end md:text-right">
              <p className="text-lg">{formatPrice(product.priceInPaise)}</p>
              <Link
                href={`/admin/products/${product.id}/edit`}
                className="inline-flex h-10 cursor-pointer items-center justify-center border border-[#111111] px-4 text-xs font-medium uppercase tracking-[0.1em] hover:bg-[#111111] hover:text-white"
              >
                Edit
              </Link>
            </div>
          </article>
        );
      })}
    </div>
  );
}

export function AdminProductsHeader() {
  return (
    <div className="mb-8 flex flex-col gap-5 border-b border-[#e5e5e5] pb-6 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="mb-3 text-xs uppercase tracking-[0.22em] text-[#777777]">
          Admin
        </p>
        <h1 className="text-4xl font-light md:text-5xl">Products</h1>
      </div>
      <Link
        href="/admin/products/new"
        className="inline-flex h-12 cursor-pointer items-center justify-center border border-[#111111] px-6 text-sm font-medium uppercase tracking-[0.08em] hover:bg-[#111111] hover:text-white"
      >
        New product
      </Link>
    </div>
  );
}
