import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X, Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { formatPrice } from '../utils/formatPrice';

export default function CartDrawer() {
  const navigate = useNavigate();
  const items = useCartStore((s) => s.items);
  const isOpen = useCartStore((s) => s.isDrawerOpen);
  const closeDrawer = useCartStore((s) => s.closeDrawer);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const totalPrice = useCartStore((s) => s.totalPrice());

  // Lock body scroll when drawer is open
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleCheckout = () => {
    closeDrawer();
    navigate('/checkout');
  };

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity duration-300 ${
          isOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={closeDrawer}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <div
        className={`fixed right-0 top-0 z-50 flex h-full w-full flex-col bg-white transition-transform duration-300 ease-in-out md:max-w-[420px] ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-5"
          style={{ borderBottom: '0.5px solid #e5e5e5' }}
        >
          <h2 className="text-xs font-medium uppercase tracking-[0.15em]">
            Your Cart
          </h2>
          <button
            type="button"
            onClick={closeDrawer}
            aria-label="Close cart"
            className="cursor-pointer bg-transparent p-0 text-text"
            style={{ border: 'none' }}
          >
            <X size={20} strokeWidth={1.5} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
              <ShoppingBag size={40} strokeWidth={1} className="text-border" />
              <p className="text-sm text-secondary">Your cart is empty</p>
              <Link
                to="/"
                onClick={closeDrawer}
                className="text-xs uppercase tracking-[0.12em] text-text underline underline-offset-4"
              >
                Continue shopping
              </Link>
            </div>
          ) : (
            <ul className="flex flex-col gap-5">
              {items.map((item) => (
                <li
                  key={item.variantId}
                  className="flex gap-4"
                  style={{ borderBottom: '0.5px solid #f0f0f0', paddingBottom: '20px' }}
                >
                  {/* Thumbnail */}
                  <img
                    src={item.imageUrl}
                    alt={item.productName}
                    className="h-12 w-12 rounded object-cover"
                    style={{ background: '#f5f3ef' }}
                  />

                  {/* Details */}
                  <div className="flex flex-1 flex-col gap-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs font-medium leading-snug">{item.productName}</p>
                        <p className="mt-0.5 text-[11px] text-secondary">
                          {item.color} / {item.size}
                        </p>
                      </div>
                      <p className="text-xs font-medium">{formatPrice(item.price)}</p>
                    </div>

                    {/* Quantity + Remove */}
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center gap-3" style={{ border: '0.5px solid #e5e5e5', borderRadius: '4px' }}>
                        <button
                          type="button"
                          aria-label="Decrease quantity"
                          onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                          className="flex h-7 w-7 cursor-pointer items-center justify-center bg-transparent text-text"
                          style={{ border: 'none' }}
                        >
                          <Minus size={12} />
                        </button>
                        <span className="min-w-[16px] text-center text-xs">{item.quantity}</span>
                        <button
                          type="button"
                          aria-label="Increase quantity"
                          onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                          className="flex h-7 w-7 cursor-pointer items-center justify-center bg-transparent text-text"
                          style={{ border: 'none' }}
                        >
                          <Plus size={12} />
                        </button>
                      </div>

                      <button
                        type="button"
                        aria-label="Remove item"
                        onClick={() => removeItem(item.variantId)}
                        className="cursor-pointer bg-transparent p-1 text-secondary transition-colors hover:text-text"
                        style={{ border: 'none' }}
                      >
                        <Trash2 size={14} strokeWidth={1.5} />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer — only show when cart has items */}
        {items.length > 0 && (
          <div className="px-6 pb-6 pt-4" style={{ borderTop: '0.5px solid #e5e5e5' }}>
            <div className="mb-1 flex items-center justify-between">
              <span className="text-xs uppercase tracking-[0.1em]">Subtotal</span>
              <span className="text-sm font-medium">{formatPrice(totalPrice)}</span>
            </div>
            <p className="mb-4 text-[11px] text-secondary">
              Shipping calculated at checkout
            </p>
            <button
              type="button"
              onClick={handleCheckout}
              className="w-full cursor-pointer bg-dark py-3.5 text-xs font-medium uppercase tracking-[0.15em] text-white transition-opacity hover:opacity-90"
              style={{ border: 'none', borderRadius: '2px' }}
            >
              Checkout
            </button>
          </div>
        )}
      </div>
    </>
  );
}
