'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getAdminProduct } from '../../../lib/api/admin-products';
import type { AdminProduct } from '../../../types/admin/products';
import { EmptyState } from '../../ui/EmptyState';
import { ErrorState } from '../../ui/ErrorState';
import { AdminProductForm } from './AdminProductForm';

export function AdminProductEditPageContent({ productId }: { productId: string }) {
  const [product, setProduct] = useState<AdminProduct | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadProduct() {
      try {
        setProduct(await getAdminProduct(productId));
      } catch (loadError) {
        setError(
          loadError instanceof Error ? loadError.message : 'Unable to load product.',
        );
      } finally {
        setIsLoading(false);
      }
    }

    void loadProduct();
  }, [productId]);

  if (isLoading) {
    return <EmptyState title="Loading product" message="Fetching catalog details." />;
  }

  if (error) {
    return <ErrorState title="Product unavailable" message={error} />;
  }

  if (!product) {
    return <ErrorState title="Product unavailable" message="Product was not found." />;
  }

  return (
    <>
      <div className="mb-8 border-b border-[#ddd4c8] pb-6 sm:mb-10 sm:pb-8">
        <p className="mb-3 text-xs uppercase tracking-[0.22em] text-[#777777]">
          Admin catalog
        </p>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-light sm:text-4xl md:text-5xl">Edit product</h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-[#5f5a53]">
              Update product details, variants, stock, status, and product imagery.
            </p>
          </div>
          <Link
            href="/admin/products"
            className="inline-flex h-11 w-full cursor-pointer items-center justify-center border border-[#ddd4c8] px-5 text-sm font-medium uppercase tracking-[0.08em] hover:border-[#111111] sm:w-auto"
          >
            Back to products
          </Link>
        </div>
      </div>
      <AdminProductForm product={product} />
    </>
  );
}
