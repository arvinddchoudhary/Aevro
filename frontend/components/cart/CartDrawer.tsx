'use client';

import { useCartStore } from '../../lib/cartStore';
import { useHasHydrated } from '../../lib/useHasHydrated';
import { formatPrice } from '../../lib/format';
import { X, Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export function CartDrawer() {
  const isDrawerOpen = useCartStore((state) => state.isDrawerOpen);
  const closeDrawer = useCartStore((state) => state.closeDrawer);
  const items = useCartStore((state) => state.items);
  const removeItem = useCartStore((state) => state.removeItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const totalInPaise = useCartStore((state) => state.totalInPaise);

  const hydrated = useHasHydrated();

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity duration-300 ${
          isDrawerOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={closeDrawer}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <div
        className={`fixed right-0 top-0 z-50 flex h-full w-full flex-col bg-white transition-transform duration-300 ease-in-out md:max-w-[420px] ${
          isDrawerOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header section */}
        <div className="flex items-center justify-between border-b border-border px-6 py-5">
          <h2 className="text-[11px] uppercase tracking-[0.25em]">Your Cart</h2>
          <button onClick={closeDrawer} aria-label="Close cart">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {!hydrated ? null : items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-4 px-6 text-center">
              <ShoppingBag size={40} className="text-[#ddd]" strokeWidth={1} />
              <p className="text-[13px] text-secondary">Your cart is empty</p>
              <Link
                href="/products"
                onClick={closeDrawer}
                className="border-b border-text pb-1 text-[11px] uppercase tracking-[0.15em]"
              >
                Continue Shopping
              </Link>
            </div>
          ) : (
            <div className="flex flex-col">
              {items.map((item) => {
                const itemKey = `${item.productId}-${item.selectedColor}-${item.selectedSize}`;
                return (
                  <div
                    key={itemKey}
                    className="flex gap-4 border-b border-border px-6 py-5"
                  >
                    {/* Image box */}
                    <div className="aspect-[3/4] w-20 shrink-0 bg-muted">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.productName}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-center">
                          <span className="text-[9px] uppercase text-secondary">
                            Image
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex flex-1 flex-col">
                      {/* Top row */}
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-[13px] text-text">
                            {item.productName}
                          </h3>
                          {(item.selectedColor || item.selectedSize) && (
                            <p className="mt-0.5 text-[11px] text-secondary">
                              {[item.selectedColor, item.selectedSize]
                                .filter(Boolean)
                                .join(' · ')}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() =>
                            removeItem(
                              item.productId,
                              item.selectedColor,
                              item.selectedSize
                            )
                          }
                          className="cursor-pointer text-[#ccc] transition-colors hover:text-text"
                          aria-label="Remove item"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>

                      {/* Bottom row */}
                      <div className="mt-auto flex items-center justify-between pt-3">
                        <div className="flex items-center">
                          <button
                            onClick={() =>
                              updateQuantity(
                                item.productId,
                                item.quantity - 1,
                                item.selectedColor,
                                item.selectedSize
                              )
                            }
                            disabled={item.quantity === 1}
                            className="flex h-7 w-7 cursor-pointer items-center justify-center border border-border disabled:opacity-40"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="w-8 text-center text-[12px]">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(
                                item.productId,
                                item.quantity + 1,
                                item.selectedColor,
                                item.selectedSize
                              )
                            }
                            className="flex h-7 w-7 cursor-pointer items-center justify-center border border-border"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                        <p className="text-[13px] text-text">
                          {formatPrice(item.priceInPaise * item.quantity)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {hydrated && items.length > 0 && (
          <div className="border-t border-border px-6 py-5">
            <div className="mb-1 flex justify-between">
              <span className="text-[12px] uppercase tracking-wide text-secondary">
                Subtotal
              </span>
              <span className="text-[14px] text-text">
                {formatPrice(totalInPaise())}
              </span>
            </div>
            <p className="mb-4 text-[11px] text-secondary">
              Shipping & taxes calculated at checkout
            </p>
            <Link
              href="/checkout"
              onClick={closeDrawer}
              className="flex h-12 w-full items-center justify-center gap-2 bg-text text-[11px] uppercase tracking-[0.2em] text-white transition-opacity hover:opacity-90"
            >
              Checkout <ArrowRight size={14} />
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
