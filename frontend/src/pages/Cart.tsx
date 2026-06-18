import { useNavigate } from 'react-router-dom';
import { Trash2, Minus, Plus, ArrowRight, ShoppingBag } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { formatPrice } from '../utils/formatPrice';

export default function Cart() {
  const navigate = useNavigate();
  const items = useCartStore((s) => s.items);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const totalItems = useCartStore((s) => s.totalItems());
  const totalPrice = useCartStore((s) => s.totalPrice());

  /* ── Empty state ── */
  if (items.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6">
        <ShoppingBag size={48} strokeWidth={1} className="text-[#ddd]" />
        <h1 className="font-display text-3xl font-light">Your cart is empty</h1>
        <p className="text-[13px] text-secondary">Discover our collection</p>
        <button
          type="button"
          onClick={() => navigate('/')}
          className="cursor-pointer bg-text px-8 py-3 text-[11px] uppercase tracking-[0.2em] text-white"
          style={{ border: 'none' }}
        >
          Shop now
        </button>
      </div>
    );
  }

  /* ── Cart with items ── */
  return (
    <div className="mx-auto grid max-w-[1200px] grid-cols-1 gap-16 px-8 py-16 lg:grid-cols-[1fr_380px]">
      {/* ── Left: Cart Items ── */}
      <div>
        <div className="mb-0 border-b border-border pb-6">
          <h1 className="mb-1 text-[11px] uppercase tracking-[0.25em]">
            YOUR CART
          </h1>
          <p className="text-[13px] text-secondary">{totalItems} items</p>
        </div>

        {items.map((item) => (
          <div
            key={item.variantId}
            className="flex gap-6 border-b border-border py-6"
          >
            {/* Thumbnail */}
            <div className="flex w-24 flex-shrink-0 items-center justify-center bg-muted"
              style={{ aspectRatio: '3/4' }}
            >
              <span className="text-[10px] uppercase tracking-widest text-secondary">
                Image
              </span>
            </div>

            {/* Details */}
            <div className="flex flex-1 flex-col">
              {/* Top row */}
              <div className="flex items-start justify-between">
                <div>
                  <p className="mb-1 text-[15px] text-text">{item.productName}</p>
                  <p className="text-[12px] tracking-wide text-secondary">
                    {item.color} · Size {item.size}
                  </p>
                  <p className="mt-2 text-[13px] text-text">
                    {formatPrice(item.price)}
                  </p>
                </div>
                <button
                  type="button"
                  aria-label="Remove item"
                  onClick={() => removeItem(item.variantId)}
                  className="cursor-pointer bg-transparent p-1 text-[#ccc] transition-colors hover:text-text"
                  style={{ border: 'none' }}
                >
                  <Trash2 size={16} />
                </button>
              </div>

              {/* Bottom row */}
              <div className="mt-4 flex items-center">
                {/* Quantity selector */}
                <div className="flex items-center">
                  <button
                    type="button"
                    disabled={item.quantity <= 1}
                    onClick={() =>
                      updateQuantity(item.variantId, item.quantity - 1)
                    }
                    className="flex h-9 w-9 cursor-pointer items-center justify-center border border-border bg-white disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Minus size={12} />
                  </button>
                  <div className="flex h-9 w-10 items-center justify-center border-t border-b border-border text-[13px]">
                    {item.quantity}
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      updateQuantity(item.variantId, item.quantity + 1)
                    }
                    className="flex h-9 w-9 cursor-pointer items-center justify-center border border-border bg-white"
                  >
                    <Plus size={12} />
                  </button>
                </div>

                {/* Item subtotal */}
                <span className="ml-auto text-[13px] text-secondary">
                  {formatPrice(item.price * item.quantity)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Right: Order Summary ── */}
      <div className="lg:sticky lg:top-24 lg:self-start">
        <h2 className="mb-6 text-[11px] uppercase tracking-[0.25em]">
          Order Summary
        </h2>

        <div className="mb-3 flex justify-between text-[13px]">
          <span>Subtotal</span>
          <span>{formatPrice(totalPrice)}</span>
        </div>
        <div className="mb-3 flex justify-between text-[13px]">
          <span>Shipping</span>
          <span className="text-secondary">Calculated at checkout</span>
        </div>
        <div className="mb-3 flex justify-between text-[13px]">
          <span>GST</span>
          <span className="text-secondary">Included</span>
        </div>

        <div className="my-4 h-px bg-border" />

        <div className="mb-8 flex items-center justify-between">
          <span className="text-[13px] uppercase tracking-wide">Total</span>
          <span className="text-[18px]">{formatPrice(totalPrice)}</span>
        </div>

        <button
          type="button"
          onClick={() => navigate('/checkout')}
          className="flex h-12 w-full cursor-pointer items-center justify-center gap-2 bg-text text-[11px] uppercase tracking-[0.2em] text-white"
          style={{ border: 'none' }}
        >
          Checkout
          <ArrowRight size={16} />
        </button>

        <p
          className="mt-4 cursor-pointer border-b border-transparent text-center text-[11px] uppercase tracking-wide text-secondary transition-colors hover:border-text hover:text-text"
          onClick={() => navigate('/')}
        >
          Continue shopping
        </p>

        <div className="mt-6 border-t border-border pt-6 text-center text-[11px] leading-relaxed text-[#bbb]">
          Secure payments via Razorpay · UPI · Cards · Net Banking
        </div>
      </div>
    </div>
  );
}
