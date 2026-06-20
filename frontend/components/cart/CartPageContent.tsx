'use client';

import Link from 'next/link';
import { formatPrice } from '../../lib/format';
import { useCart } from '../../lib/cart';
import { EmptyState } from '../ui/EmptyState';
import { CartQuantityControls } from './CartQuantityControls';

export function CartPageContent() {
  const { items, subtotalInPaise, clearCart } = useCart();

  if (items.length === 0) {
    return (
      <EmptyState
        title="Cart is empty"
        message="Add a product to start building your AEVRO order."
      />
    );
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_360px]">
      <section className="space-y-6">
        {items.map((item) => (
          <article
            key={item.itemKey}
            className="grid gap-5 border-b border-[#e5e5e5] pb-6 sm:grid-cols-[140px_1fr]"
          >
            <Link
              href={`/products/${item.slug}`}
              className="aspect-[3/4] overflow-hidden bg-[#f5f5f5]"
            >
              {item.imageUrl ? (
                <img
                  src={item.imageUrl}
                  alt={item.imageAltText ?? item.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-xs uppercase tracking-[0.18em] text-[#777777]">
                  AEVRO
                </div>
              )}
            </Link>

            <div className="flex flex-col gap-5 sm:flex-row sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-[#777777]">
                  {item.categoryName ?? 'AEVRO'}
                </p>
                <Link
                  href={`/products/${item.slug}`}
                  className="mt-2 block text-lg underline-offset-4 hover:underline"
                >
                  {item.name}
                </Link>
                <p className="mt-2 text-sm text-[#555555]">
                  {formatPrice(item.priceInPaise)}
                </p>
                {(item.selectedColor || item.selectedSize) && (
                  <div className="mt-3 space-y-1 text-sm text-[#555555]">
                    {item.selectedColor && <p>Colour: {item.selectedColor}</p>}
                    {item.selectedSize && <p>Size: {item.selectedSize}</p>}
                  </div>
                )}
                <div className="mt-5">
                  <CartQuantityControls
                    itemKey={item.itemKey}
                    quantity={item.quantity}
                    stock={item.stock}
                  />
                </div>
              </div>

              <div className="text-sm sm:text-right">
                <p className="text-[#777777]">Subtotal</p>
                <p className="mt-1 font-medium">
                  {formatPrice(item.priceInPaise * item.quantity)}
                </p>
              </div>
            </div>
          </article>
        ))}
      </section>

      <aside className="h-fit border border-[#e5e5e5] p-6">
        <p className="text-xs uppercase tracking-[0.2em] text-[#777777]">
          Summary
        </p>
        <div className="mt-6 flex items-center justify-between border-b border-[#e5e5e5] pb-4 text-sm">
          <span>Subtotal</span>
          <span>{formatPrice(subtotalInPaise)}</span>
        </div>
        <div className="mt-4 flex items-center justify-between text-lg">
          <span>Total</span>
          <span>{formatPrice(subtotalInPaise)}</span>
        </div>
        <p className="mt-4 text-sm leading-6 text-[#666666]">
          Checkout collects customer and shipping details before payment is added.
        </p>
        <div className="mt-6 flex flex-col gap-3">
          <Link
            href="/checkout"
            className="inline-flex h-12 items-center justify-center border border-[#111111] px-6 text-sm font-medium uppercase tracking-[0.08em] hover:bg-[#111111] hover:text-white"
          >
            Continue to checkout
          </Link>
          <Link
            href="/products"
            className="inline-flex h-12 items-center justify-center border border-[#d9d9d9] px-6 text-sm font-medium uppercase tracking-[0.08em] hover:border-[#111111]"
          >
            Continue shopping
          </Link>
          <button
            type="button"
            onClick={clearCart}
            className="h-12 border border-[#d9d9d9] text-sm font-medium uppercase tracking-[0.08em] hover:border-[#111111]"
          >
            Clear cart
          </button>
        </div>
      </aside>
    </div>
  );
}
