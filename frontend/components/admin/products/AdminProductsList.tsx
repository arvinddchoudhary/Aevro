'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getAdminProducts, reorderAdminProducts } from '../../../lib/api/admin-products';
import { formatPrice } from '../../../lib/format';
import type { AdminProduct } from '../../../types/admin/products';
import { EmptyState } from '../../ui/EmptyState';
import { ErrorState } from '../../ui/ErrorState';

export function AdminProductsList() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [draftProducts, setDraftProducts] = useState<AdminProduct[] | null>(null);
  const [isSavingOrder, setIsSavingOrder] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [draggedProductId, setDraggedProductId] = useState<string | null>(null);

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

  const isArranging = draftProducts !== null;
  const displayedProducts = draftProducts ?? products;

  const moveProduct = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= displayedProducts.length || fromIndex === toIndex) return;

    const next = [...displayedProducts];
    const [moved] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, moved);
    setDraftProducts(next);
  };

  const startArranging = () => {
    setOrderError(null);
    setDraftProducts([...products]);
  };

  const cancelArranging = () => {
    if (isSavingOrder) return;
    setDraftProducts(null);
    setOrderError(null);
    setDraggedProductId(null);
  };

  const saveOrder = async () => {
    if (!draftProducts || isSavingOrder) return;

    try {
      setIsSavingOrder(true);
      setOrderError(null);
      const updatedProducts = await reorderAdminProducts(draftProducts.map((product) => product.id));
      setProducts(updatedProducts);
      setDraftProducts(null);
    } catch (saveError) {
      setOrderError(saveError instanceof Error ? saveError.message : 'Unable to save the catalog order.');
    } finally {
      setIsSavingOrder(false);
      setDraggedProductId(null);
    }
  };

  return (
    <div className="space-y-4">
      <section className="border border-[#ddd4c8] bg-[#f5efe6] p-4 sm:flex sm:items-center sm:justify-between sm:gap-5 sm:p-5">
        <div>
          <p className="text-sm font-medium">Catalog order</p>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-[#5f5a53]">
            Choose which product appears first in the storefront. Drag products on desktop, or use the move controls on any device.
          </p>
        </div>
        {isArranging ? (
          <div className="mt-4 flex flex-wrap gap-2 sm:mt-0 sm:shrink-0">
            <button
              type="button"
              onClick={cancelArranging}
              disabled={isSavingOrder}
              className="inline-flex h-10 items-center justify-center border border-[#111111] px-4 text-xs font-medium uppercase tracking-[0.1em] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => void saveOrder()}
              disabled={isSavingOrder}
              className="inline-flex h-10 items-center justify-center bg-[#111111] px-4 text-xs font-medium uppercase tracking-[0.1em] text-[#fffaf3] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSavingOrder ? 'Saving…' : 'Save order'}
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={startArranging}
            className="mt-4 inline-flex h-10 items-center justify-center border border-[#111111] px-4 text-xs font-medium uppercase tracking-[0.1em] hover:bg-[#111111] hover:text-[#fffaf3] sm:mt-0 sm:shrink-0"
          >
            Arrange products
          </button>
        )}
      </section>

      {orderError ? (
        <p role="alert" className="border border-[#a84332] bg-[#fff5f2] px-4 py-3 text-sm text-[#8a1f1f]">
          {orderError}
        </p>
      ) : null}

      {displayedProducts.map((product, index) => {
        const lowStockVariants = product.variants.filter((variant) => variant.lowStock);
        const outOfStockVariants = product.variants.filter((variant) => variant.stock <= 0);

        return (
          <article
            key={product.id}
            draggable={isArranging}
            onDragStart={() => setDraggedProductId(product.id)}
            onDragOver={(event) => {
              if (isArranging) event.preventDefault();
            }}
            onDrop={(event) => {
              event.preventDefault();
              if (!isArranging || !draggedProductId) return;
              const fromIndex = displayedProducts.findIndex((item) => item.id === draggedProductId);
              moveProduct(fromIndex, index);
            }}
            onDragEnd={() => setDraggedProductId(null)}
            className="grid gap-4 border border-[#ddd4c8] bg-[#fffaf3] p-4 transition hover:border-[#111111] sm:gap-5 sm:p-5 md:grid-cols-[96px_1fr_auto]"
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
                <span className="border border-[#ddd4c8] px-3 py-1 text-xs uppercase tracking-[0.16em] text-[#5f5a53]">
                  {product.status}
                </span>
              </div>
              <p className="mt-3 text-base sm:text-lg">{product.name}</p>
              <p className="mt-2 text-sm text-[#5f5a53]">
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
              {isArranging ? (
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <span className="mr-2 text-xs font-medium uppercase tracking-[0.12em] text-[#5f5a53]">
                    Position {index + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => moveProduct(index, index - 1)}
                    disabled={index === 0 || isSavingOrder}
                    className="h-9 border border-[#111111] px-3 text-xs uppercase tracking-[0.08em] disabled:cursor-not-allowed disabled:opacity-35"
                    aria-label={`Move ${product.name} earlier`}
                  >
                    Move up
                  </button>
                  <button
                    type="button"
                    onClick={() => moveProduct(index, index + 1)}
                    disabled={index === displayedProducts.length - 1 || isSavingOrder}
                    className="h-9 border border-[#111111] px-3 text-xs uppercase tracking-[0.08em] disabled:cursor-not-allowed disabled:opacity-35"
                    aria-label={`Move ${product.name} later`}
                  >
                    Move down
                  </button>
                </div>
              ) : null}
            </div>
            <div className="flex flex-col items-start gap-4 text-left md:items-end md:text-right">
              <p className="text-base sm:text-lg">{formatPrice(product.priceInPaise)}</p>
              <Link
                href={`/admin/products/${product.id}/edit`}
                className="inline-flex h-10 cursor-pointer items-center justify-center border border-[#111111] px-4 text-xs font-medium uppercase tracking-[0.1em] hover:bg-[#111111] hover:text-[#fffaf3]"
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
    <div className="mb-8 flex flex-col gap-5 border-b border-[#ddd4c8] pb-6 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="mb-3 text-xs uppercase tracking-[0.22em] text-[#777777]">
          Admin
        </p>
        <h1 className="text-3xl font-light sm:text-4xl md:text-5xl">Products</h1>
      </div>
      <Link
        href="/admin/products/new"
        className="inline-flex h-12 w-full cursor-pointer items-center justify-center border border-[#111111] px-6 text-sm font-medium uppercase tracking-[0.08em] hover:bg-[#111111] hover:text-[#fffaf3] sm:w-auto"
      >
        New product
      </Link>
    </div>
  );
}
