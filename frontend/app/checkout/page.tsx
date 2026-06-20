'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Lock } from 'lucide-react';
import { useCartStore } from '../../lib/cartStore';
import { useHasHydrated } from '../../lib/useHasHydrated';
import { formatPrice } from '../../lib/format';

export default function CheckoutPage() {
  const router = useRouter();
  const hydrated = useHasHydrated();
  const cartStore = useCartStore();

  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    shippingAddress: '',
    shippingCity: '',
    shippingState: '',
    shippingPincode: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (hydrated && cartStore.items.length === 0) {
      router.push('/products');
    }
  }, [hydrated, cartStore.items.length, router]);

  if (!hydrated || cartStore.items.length === 0) {
    return null;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handlePayment = async () => {
    if (
      !formData.customerName ||
      !formData.customerEmail ||
      !formData.customerPhone ||
      !formData.shippingAddress ||
      !formData.shippingCity ||
      !formData.shippingState ||
      !formData.shippingPincode
    ) {
      setError('Please fill in all fields.');
      return;
    }

    if (!/^\d{10}$/.test(formData.customerPhone)) {
      setError('Please enter a valid 10-digit phone number.');
      return;
    }

    if (!/^\d{6}$/.test(formData.shippingPincode)) {
      setError('Please enter a valid 6-digit pincode.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const payload = {
        ...formData,
        items: cartStore.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          selectedColor: item.selectedColor,
          selectedSize: item.selectedSize,
        })),
      };

      const orderRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/orders`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      );

      if (!orderRes.ok) {
        throw new Error('Failed to create order.');
      }

      const orderResult = await orderRes.json();
      const order = orderResult.data;

      const razorpayRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/payments/create-order`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId: order.id }),
        }
      );

      if (!razorpayRes.ok) {
        throw new Error('Failed to initialize payment.');
      }

      const paymentResult = await razorpayRes.json();
      const { razorpayOrderId, amount, currency, keyId } = paymentResult.data;

      const loadRazorpayScript = (): Promise<boolean> => {
        return new Promise((resolve) => {
          if (document.getElementById('razorpay-script')) return resolve(true);
          const script = document.createElement('script');
          script.id = 'razorpay-script';
          script.src = 'https://checkout.razorpay.com/v1/checkout.js';
          script.onload = () => resolve(true);
          script.onerror = () => resolve(false);
          document.body.appendChild(script);
        });
      };

      const isScriptLoaded = await loadRazorpayScript();
      if (!isScriptLoaded) {
        throw new Error('Failed to load payment gateway.');
      }

      const rzp = new (window as any).Razorpay({
        key: keyId,
        amount: amount,
        currency: currency,
        name: 'AEVRO',
        description: 'Premium Wide-Leg Trousers',
        order_id: razorpayOrderId,
        prefill: {
          name: formData.customerName,
          email: formData.customerEmail,
          contact: formData.customerPhone,
        },
        theme: { color: '#111111' },
        handler: async (response: any) => {
          const verifyRes = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/payments/verify`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
                orderId: order.id,
              }),
            }
          );

          if (verifyRes.ok) {
            cartStore.clearCart();
            router.push(`/success?orderId=${order.id}`);
          } else {
            setError('Payment verification failed. Please contact support.');
            setIsLoading(false);
          }
        },
        modal: {
          ondismiss: () => setIsLoading(false),
        },
      });

      rzp.open();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Something went wrong. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <main className="mx-auto grid max-w-[1200px] grid-cols-1 gap-12 px-6 py-12 lg:grid-cols-[1fr_400px] lg:gap-16 lg:px-12 lg:py-16">
      {/* LEFT COLUMN */}
      <div>
        <Link
          href="/products"
          className="mb-8 flex items-center gap-1 text-[11px] uppercase tracking-[0.1em] text-secondary transition-colors hover:text-text"
        >
          <ChevronLeft size={14} /> Back to shop
        </Link>

        <h1 className="mb-2 text-3xl font-light lg:text-4xl" style={{ fontFamily: 'var(--font-display)' }}>
          Checkout
        </h1>
        <p className="mb-8 text-[13px] text-secondary">Delivery information</p>

        {/* Form Sections */}
        <div>
          {/* SECTION "Contact" */}
          <h2 className="mb-4 border-b border-border pb-2 text-[11px] uppercase tracking-[0.2em]">
            Contact
          </h2>

          <div className="mb-4">
            <label className="mb-1.5 block text-[11px] uppercase tracking-[0.1em] text-secondary">
              Full Name
            </label>
            <input
              type="text"
              name="customerName"
              value={formData.customerName}
              onChange={handleInputChange}
              className="h-11 w-full border border-border bg-white px-4 text-[13px] outline-none transition-colors focus:border-text"
            />
          </div>

          <div className="mb-4">
            <label className="mb-1.5 block text-[11px] uppercase tracking-[0.1em] text-secondary">
              Phone Number
            </label>
            <input
              type="tel"
              name="customerPhone"
              value={formData.customerPhone}
              onChange={handleInputChange}
              className="h-11 w-full border border-border bg-white px-4 text-[13px] outline-none transition-colors focus:border-text"
            />
          </div>

          <div className="mb-4">
            <label className="mb-1.5 block text-[11px] uppercase tracking-[0.1em] text-secondary">
              Email Address
            </label>
            <input
              type="email"
              name="customerEmail"
              value={formData.customerEmail}
              onChange={handleInputChange}
              className="h-11 w-full border border-border bg-white px-4 text-[13px] outline-none transition-colors focus:border-text"
            />
          </div>

          {/* SECTION "Delivery Address" */}
          <h2 className="mb-4 mt-8 border-b border-border pb-2 text-[11px] uppercase tracking-[0.2em]">
            Delivery Address
          </h2>

          <div className="mb-4">
            <label className="mb-1.5 block text-[11px] uppercase tracking-[0.1em] text-secondary">
              Address
            </label>
            <input
              type="text"
              name="shippingAddress"
              value={formData.shippingAddress}
              onChange={handleInputChange}
              className="h-11 w-full border border-border bg-white px-4 text-[13px] outline-none transition-colors focus:border-text"
            />
          </div>

          <div className="mb-4 grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-[11px] uppercase tracking-[0.1em] text-secondary">
                City
              </label>
              <input
                type="text"
                name="shippingCity"
                value={formData.shippingCity}
                onChange={handleInputChange}
                className="h-11 w-full border border-border bg-white px-4 text-[13px] outline-none transition-colors focus:border-text"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-[11px] uppercase tracking-[0.1em] text-secondary">
                State
              </label>
              <input
                type="text"
                name="shippingState"
                value={formData.shippingState}
                onChange={handleInputChange}
                className="h-11 w-full border border-border bg-white px-4 text-[13px] outline-none transition-colors focus:border-text"
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
                name="shippingPincode"
                value={formData.shippingPincode}
                onChange={handleInputChange}
                className="h-11 w-full border border-border bg-white px-4 text-[13px] outline-none transition-colors focus:border-text"
              />
            </div>
            <div />
          </div>

          {error && (
            <div className="mt-4 border border-red-200 bg-red-50 p-4 text-[13px] text-red-600">
              {error}
            </div>
          )}

          <button
            onClick={handlePayment}
            disabled={isLoading}
            className="mt-8 flex h-12 w-full items-center justify-center gap-2 bg-text text-[11px] uppercase tracking-[0.2em] text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Lock size={14} />
            {isLoading
              ? 'Processing...'
              : `Pay Securely — ${formatPrice(cartStore.totalInPaise())}`}
          </button>
        </div>
      </div>

      {/* RIGHT COLUMN */}
      <div className="self-start lg:sticky lg:top-24">
        <h2 className="mb-6 text-[11px] uppercase tracking-[0.25em]">
          Order Summary
        </h2>

        <div>
          {cartStore.items.map((item, index) => (
            <div
              key={index}
              className="flex items-start justify-between border-b border-border py-3"
            >
              <div>
                <p className="text-[13px] text-text">{item.productName}</p>
                {(item.selectedColor || item.selectedSize) && (
                  <p className="mt-0.5 text-[11px] text-secondary">
                    {[item.selectedColor, item.selectedSize]
                      .filter(Boolean)
                      .join(' · ')}
                  </p>
                )}
                <p className="mt-0.5 text-[11px] text-secondary">
                  Qty {item.quantity}
                </p>
              </div>
              <p className="text-[13px] text-text">
                {formatPrice(item.priceInPaise * item.quantity)}
              </p>
            </div>
          ))}

          <div className="mt-4 flex items-center justify-between py-2 text-[13px]">
            <span className="text-secondary">Subtotal</span>
            <span className="text-text">
              {formatPrice(cartStore.totalInPaise())}
            </span>
          </div>
          <div className="flex items-center justify-between border-b border-border py-2 pb-4 text-[13px]">
            <span className="text-secondary">Shipping</span>
            <span className="text-text">Free</span>
          </div>
          <div className="mt-4 flex items-center justify-between text-[15px] font-medium text-text">
            <span>Total</span>
            <span>{formatPrice(cartStore.totalInPaise())}</span>
          </div>

          <div className="mt-6 flex items-center justify-center gap-2 text-[11px] text-[#bbb]">
            <Lock size={12} />
            <span>256-bit SSL encrypted checkout</span>
          </div>
        </div>
      </div>
    </main>
  );
}
