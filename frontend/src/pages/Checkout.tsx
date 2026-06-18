import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Lock } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { formatPrice } from '../utils/formatPrice';
import { createOrder, createRazorpayOrder, verifyPayment } from '../services/order.service';
import { loadRazorpayScript, openRazorpayCheckout } from '../utils/razorpay';
import type { OrderFormData } from '../types';

const inputClass =
  'w-full h-11 border border-border px-4 text-[13px] outline-none focus:border-text transition-colors bg-white';

export default function Checkout() {
  const navigate = useNavigate();
  const items = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clearCart);
  const totalPrice = useCartStore((s) => s.totalPrice());

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<OrderFormData>({
    customer_name: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
  });

  const update = (field: keyof OrderFormData, value: string) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const handlePayment = async () => {
    // Validate all fields filled
    const emptyField = Object.values(formData).some((v) => v.trim() === '');
    if (emptyField) {
      setError('Please fill in all fields');
      return;
    }

    // Validate phone (10 digits)
    if (!/^\d{10}$/.test(formData.phone)) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }

    // Validate pincode (6 digits)
    if (!/^\d{6}$/.test(formData.pincode)) {
      setError('Please enter a valid 6-digit pincode');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // 1. Create order
      const orderPayload = {
        ...formData,
        items: items.map((item) => ({
          variant_id: item.variantId,
          quantity: item.quantity,
          price: item.price,
        })),
        total_amount: totalPrice,
      };
      const orderResponse = await createOrder(orderPayload);

      // 2. Create Razorpay order
      const razorpayData = await createRazorpayOrder(
        orderResponse.id,
        totalPrice,
      );

      // 3. Load Razorpay script
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        setError('Failed to load payment gateway. Please try again.');
        setIsLoading(false);
        return;
      }

      // 4. Open Razorpay checkout
      openRazorpayCheckout({
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: totalPrice,
        currency: 'INR',
        name: 'AEVRO',
        description: 'Wide-Leg Pleated Trousers',
        order_id: razorpayData.razorpay_order_id,
        prefill: {
          name: formData.customer_name,
          email: formData.email,
          contact: formData.phone,
        },
        theme: { color: '#111111' },
        handler: async (response) => {
          try {
            await verifyPayment({
              ...response,
              order_id: orderResponse.id,
            });
            clearCart();
            navigate(
              `/success?order_id=${orderResponse.id}&order_number=${orderResponse.order_number}`,
            );
          } catch {
            setError('Payment verification failed. Please contact support.');
            setIsLoading(false);
          }
        },
      });

      setIsLoading(false);
    } catch {
      setError('Payment failed. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto grid min-h-screen max-w-[1200px] grid-cols-1 gap-16 px-8 py-16 lg:grid-cols-[1fr_400px]">
      {/* ── Left: Checkout Form ── */}
      <div>
        {/* Back link */}
        <button
          type="button"
          onClick={() => navigate('/cart')}
          className="mb-8 flex cursor-pointer items-center gap-1 bg-transparent p-0 text-[11px] uppercase tracking-[0.1em] text-secondary transition-colors hover:text-text"
          style={{ border: 'none' }}
        >
          <ChevronLeft size={14} />
          Back to cart
        </button>

        <h1 className="font-display mb-2 text-4xl font-light">Checkout</h1>
        <p className="mb-8 text-[13px] text-secondary">Delivery information</p>

        {/* ── Contact Section ── */}
        <h2 className="mb-4 border-b border-border pb-2 text-[11px] uppercase tracking-[0.2em]">
          Contact
        </h2>

        <div className="mb-4">
          <label className="mb-1.5 block text-[11px] uppercase tracking-[0.1em] text-secondary">
            Full Name
          </label>
          <input
            type="text"
            value={formData.customer_name}
            onChange={(e) => update('customer_name', e.target.value)}
            className={inputClass}
            placeholder="John Doe"
          />
        </div>
        <div className="mb-4">
          <label className="mb-1.5 block text-[11px] uppercase tracking-[0.1em] text-secondary">
            Phone Number
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => update('phone', e.target.value)}
            className={inputClass}
            placeholder="9876543210"
          />
        </div>
        <div className="mb-4">
          <label className="mb-1.5 block text-[11px] uppercase tracking-[0.1em] text-secondary">
            Email Address
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => update('email', e.target.value)}
            className={inputClass}
            placeholder="john@example.com"
          />
        </div>

        {/* ── Delivery Address Section ── */}
        <h2 className="mb-4 mt-8 border-b border-border pb-2 text-[11px] uppercase tracking-[0.2em]">
          Delivery Address
        </h2>

        <div className="mb-4">
          <label className="mb-1.5 block text-[11px] uppercase tracking-[0.1em] text-secondary">
            Address / Flat, Building, Street
          </label>
          <input
            type="text"
            value={formData.address}
            onChange={(e) => update('address', e.target.value)}
            className={inputClass}
            placeholder="123, Example Street, Apt 4B"
          />
        </div>

        <div className="mb-4 grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-[11px] uppercase tracking-[0.1em] text-secondary">
              City
            </label>
            <input
              type="text"
              value={formData.city}
              onChange={(e) => update('city', e.target.value)}
              className={inputClass}
              placeholder="Mumbai"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-[11px] uppercase tracking-[0.1em] text-secondary">
              State
            </label>
            <input
              type="text"
              value={formData.state}
              onChange={(e) => update('state', e.target.value)}
              className={inputClass}
              placeholder="Maharashtra"
            />
          </div>
        </div>

        <div className="mb-4 grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-[11px] uppercase tracking-[0.1em] text-secondary">
              Pincode
            </label>
            <input
              type="text"
              value={formData.pincode}
              onChange={(e) => update('pincode', e.target.value)}
              className={inputClass}
              placeholder="400001"
            />
          </div>
          <div /> {/* Spacer */}
        </div>

        {/* Error */}
        {error && (
          <div className="mt-4 border border-red-200 bg-red-50 p-4 text-[13px] text-red-600">
            {error}
          </div>
        )}

        {/* Pay button */}
        <button
          type="button"
          disabled={isLoading}
          onClick={handlePayment}
          className={`mt-8 flex h-12 w-full cursor-pointer items-center justify-center gap-2 bg-text text-[11px] uppercase tracking-[0.2em] text-white ${
            isLoading ? 'cursor-not-allowed opacity-70' : ''
          }`}
          style={{ border: 'none' }}
        >
          <Lock size={16} />
          {isLoading
            ? 'Processing...'
            : `Pay Securely — ${formatPrice(totalPrice)}`}
        </button>
      </div>

      {/* ── Right: Order Summary ── */}
      <div className="lg:sticky lg:top-24 lg:self-start">
        <h2 className="mb-6 text-[11px] uppercase tracking-[0.25em]">
          Order Summary
        </h2>

        {/* Cart items (compact) */}
        {items.length === 0 ? (
          <p className="text-[13px] text-secondary">Your cart is empty</p>
        ) : (
          items.map((item) => (
            <div
              key={item.variantId}
              className="flex items-start justify-between border-b border-border py-3"
            >
              <div>
                <p className="text-[13px]">{item.productName}</p>
                <p className="mt-0.5 text-[11px] text-secondary">
                  {item.color} · Size {item.size}
                </p>
                <p className="text-[11px] text-secondary">Qty: {item.quantity}</p>
              </div>
              <span className="text-[13px]">
                {formatPrice(item.price * item.quantity)}
              </span>
            </div>
          ))
        )}

        <div className="my-4 h-px bg-border" />

        <div className="mb-3 flex justify-between text-[13px]">
          <span>Subtotal</span>
          <span>{formatPrice(totalPrice)}</span>
        </div>
        <div className="mb-3 flex justify-between text-[13px]">
          <span>Shipping</span>
          <span className="text-secondary">Free</span>
        </div>
        <div className="mb-3 flex justify-between text-[13px]">
          <span>GST</span>
          <span className="text-secondary">Included</span>
        </div>

        <div className="my-4 h-px bg-border" />

        <div className="flex items-center justify-between">
          <span className="text-[15px] font-medium">Total</span>
          <span className="text-[15px] font-medium">
            {formatPrice(totalPrice)}
          </span>
        </div>

        <div className="mt-6 flex items-center justify-center gap-2 text-[11px] text-[#bbb]">
          <Lock size={12} />
          256-bit SSL encrypted checkout
        </div>
      </div>
    </div>
  );
}
