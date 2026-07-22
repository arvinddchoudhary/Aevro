'use client';

import Link from 'next/link';
import { formatPrice } from '../../lib/format';
import { useCart } from '../../lib/cart';
import { EmptyState } from '../ui/EmptyState';
import { CartQuantityControls } from './CartQuantityControls';
import { CloudinaryProductImage } from '../products/CloudinaryProductImage';

export function CartPageContent() {
  const { items, subtotalInPaise, clearCart } = useCart();
  const hasStockWarnings = items.some(
    (item) => item.stock <= 0 || item.quantity >= item.stock,
  );

  if (items.length === 0) {
    return (
      <EmptyState
        title="Cart is empty"
        message="Add a product to start building your AEVRO order."
      />
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] xl:grid-cols-[minmax(0,1fr)_390px]">
      <section className="space-y-4 sm:space-y-6">
        {items.map((item) => (
          <article
            key={item.itemKey}
            className="grid gap-4 border border-[#ddd4c8] bg-[#fffaf3]/72 p-3 sm:grid-cols-[150px_1fr] sm:border-x-0 sm:border-t-0 sm:bg-transparent sm:p-0 sm:pb-6 md:grid-cols-[170px_1fr]"
          >
            <Link
              href={`/products/${item.slug}`}
              className="relative aspect-[1086/1448] w-full max-w-[124px] cursor-pointer overflow-hidden rounded-[4px] bg-[#eee8de] sm:max-w-[150px] md:max-w-[170px]"
            >
              {item.imageUrl ? (
                <CloudinaryProductImage
                  src={item.imageUrl}
                  alt={item.imageAltText ?? item.name}
                  delivery="thumbnail"
                  sizes="(max-width: 639px) 124px, (max-width: 767px) 150px, 170px"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-xs uppercase tracking-[0.18em] text-[#777777]">
                  AEVRO
                </div>
              )}
            </Link>

            <div className="flex min-w-0 flex-col justify-center gap-5 sm:flex-row sm:justify-between">
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-[0.12em] text-[#77716a]">
                  {item.categoryName ?? 'AEVRO'}
                </p>
                <Link
                  href={`/products/${item.slug}`}
                className="mt-2 block cursor-pointer break-words text-base font-light uppercase leading-tight underline-offset-4 hover:underline sm:text-xl"
                >
                  {item.name}
                </Link>
                <p className="mt-3 text-base">
                  {formatPrice(item.priceInPaise)}
                </p>
                {(item.selectedColor || item.selectedSize) && (
                  <div className="mt-3 flex flex-wrap gap-2 text-sm text-[#514c45] sm:gap-3">
                    {item.selectedColor && <p>{item.selectedColor}</p>}
                    {item.selectedColor && item.selectedSize && <span>/</span>}
                    {item.selectedSize && <p>Size: {item.selectedSize}</p>}
                  </div>
                )}
                {item.stock <= 0 ? (
                  <p className="mt-3 text-sm text-[#8a1f1f]">
                    This variant is currently out of stock.
                  </p>
                ) : item.quantity >= item.stock ? (
                  <p className="mt-3 text-sm text-[#8a1f1f]">
                    You have selected the maximum available quantity.
                  </p>
                ) : item.stock <= 5 ? (
                  <p className="mt-3 text-sm text-[#8a1f1f]">
                    This selection has limited availability.
                  </p>
                ) : null}
                <div className="mt-4">
                  <CartQuantityControls
                    itemKey={item.itemKey}
                    quantity={item.quantity}
                    stock={item.stock}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 text-sm sm:block sm:text-right">
                <p className="text-[#77716a]">Subtotal</p>
                <p className="mt-1 font-medium">
                  {formatPrice(item.priceInPaise * item.quantity)}
                </p>
              </div>
            </div>
          </article>
        ))}
      </section>

      <aside className="h-fit border border-[#ddd4c8] bg-[#fffaf3]/70 p-5 sm:p-6 lg:sticky lg:top-24">
        <p className="text-sm font-medium uppercase tracking-[0.08em]">
          Order summary
        </p>
        <div className="mt-6 flex items-center justify-between text-sm">
          <span>Subtotal</span>
          <span>{formatPrice(subtotalInPaise)}</span>
        </div>
        <div className="mt-4 flex items-center justify-between text-sm">
          <span>Shipping</span>
          <span>Free</span>
        </div>
        <div className="mt-6 flex items-center justify-between border-t border-[#ddd4c8] pt-6 text-xl">
          <span>Total</span>
          <span>{formatPrice(subtotalInPaise)}</span>
        </div>
        <p className="mt-5 text-sm leading-6 text-[#514c45]">
          Checkout collects customer and shipping details before payment is added.
        </p>
        {hasStockWarnings && (
          <p className="mt-4 border border-[#8a1f1f] p-4 text-sm leading-6 text-[#8a1f1f]">
            Stock is limited for one or more items. Final availability is checked
            again before payment.
          </p>
        )}
        <div className="mt-6 flex flex-col gap-3">
          <Link
            href="/checkout"
            className="inline-flex h-12 cursor-pointer items-center justify-center bg-[#111111] px-6 text-xs font-medium uppercase tracking-[0.08em] hover:bg-[#2a2825]"
            style={{ color: '#fffaf3' }}
          >
            Continue to checkout
          </Link>
          <Link
            href="/products"
            className="inline-flex h-12 cursor-pointer items-center justify-center border border-[#ddd4c8] px-6 text-xs font-medium uppercase tracking-[0.08em] hover:border-[#111111]"
          >
            Continue shopping
          </Link>
          <button
            type="button"
            onClick={clearCart}
            className="h-12 cursor-pointer border border-[#ddd4c8] text-xs font-medium uppercase tracking-[0.08em] hover:border-[#111111]"
          >
            Clear cart
          </button>
        </div>
      </aside>
    </div>
  );
}
