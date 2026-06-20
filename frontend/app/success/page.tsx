'use client';

import { useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import { CheckCircle, Package, ArrowRight, Lock } from 'lucide-react';
import Link from 'next/link';
import { formatPrice } from '../../lib/format';

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');

  const [order, setOrder] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);

  useEffect(() => {
    if (!orderId) {
      setFetchError(true);
      setIsLoading(false);
      return;
    }

    const fetchOrder = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/orders/${orderId}`
        );
        if (!res.ok) throw new Error('Order not found');
        const data = await res.json();
        setOrder(data.data);
      } catch (err) {
        console.error(err);
        setFetchError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  if (isLoading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center px-6 py-16">
        <p className="animate-pulse text-[11px] uppercase tracking-[0.3em] text-secondary">
          Confirming your order...
        </p>
      </main>
    );
  }

  if (fetchError || !order) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center px-6 py-16">
        <div className="mx-auto max-w-[480px] text-center">
          <CheckCircle size={48} className="mx-auto mb-6 text-text" strokeWidth={1} />
          <p className="mb-3 text-[10px] uppercase tracking-[0.3em] text-secondary">
            Order Confirmed
          </p>
          <h1
            className="mb-4 text-3xl font-light lg:text-4xl"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Thank you.
          </h1>
          <p className="mb-8 text-[13px] text-secondary">
            Your payment was successful. You'll receive a confirmation shortly.
          </p>
          <Link
            href="/products"
            className="flex h-12 w-full items-center justify-center gap-2 bg-text text-[11px] uppercase tracking-[0.2em] text-white transition-opacity hover:opacity-90"
          >
            Continue shopping <ArrowRight size={14} />
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center px-6 py-16">
      <div className="w-full max-w-[560px] text-center">
        <CheckCircle size={48} className="mx-auto mb-6 text-text" strokeWidth={1} />
        <p className="mb-3 text-[10px] uppercase tracking-[0.3em] text-secondary">
          Order Confirmed
        </p>
        <h1
          className="mb-2 text-3xl font-light lg:text-4xl"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Thank you.
        </h1>
        <p className="mb-8 text-[13px] text-secondary">
          Order <span className="font-medium text-text">{order.orderNumber}</span>
        </p>

        <div className="mb-8 h-px bg-border" />

        {/* What happens next section */}
        <div className="mb-8 text-left">
          <h2 className="mb-6 text-[11px] uppercase tracking-[0.2em]">
            What happens next
          </h2>
          <div className="flex flex-col gap-5">
            <div className="flex items-start gap-4">
              <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-text text-[10px] text-white">
                1
              </div>
              <div>
                <p className="mb-0.5 text-[13px] text-text">Order received</p>
                <p className="text-[12px] leading-relaxed text-secondary">
                  We've received your order and payment confirmation.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-text text-[10px] text-white">
                2
              </div>
              <div>
                <p className="mb-0.5 text-[13px] text-text">Quality check</p>
                <p className="text-[12px] leading-relaxed text-secondary">
                  Your order is inspected and packed with care before dispatch.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-text text-[10px] text-white">
                3
              </div>
              <div>
                <p className="mb-0.5 text-[13px] text-text">On its way</p>
                <p className="text-[12px] leading-relaxed text-secondary">
                  Dispatched within 2–3 business days. Tracking sent via email.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-8 h-px bg-border" />

        {/* Order details */}
        <div className="mb-8 text-left">
          <h2 className="mb-4 text-[11px] uppercase tracking-[0.2em]">
            Order details
          </h2>
          <div className="flex justify-between border-b border-border py-2 text-[13px]">
            <span className="text-secondary">Order number</span>
            <span className="text-text">{order.orderNumber}</span>
          </div>
          <div className="flex justify-between border-b border-border py-2 text-[13px]">
            <span className="text-secondary">Payment</span>
            <span className="flex items-center text-text">
              <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-green-500" />
              Paid
            </span>
          </div>
          <div className="flex justify-between border-b border-border py-2 text-[13px]">
            <span className="text-secondary">Amount</span>
            <span className="text-text">{formatPrice(order.totalInPaise)}</span>
          </div>
          <div className="flex justify-between border-b border-border py-2 text-[13px]">
            <span className="text-secondary">Status</span>
            <span className="capitalize text-text">{order.status.toLowerCase()}</span>
          </div>
        </div>

        {/* Bottom actions */}
        <div className="mt-8 flex flex-col gap-3">
          <Link
            href="/products"
            className="flex h-12 w-full items-center justify-center gap-2 bg-text text-[11px] uppercase tracking-[0.2em] text-white transition-opacity hover:opacity-90"
          >
            Continue shopping <ArrowRight size={14} />
          </Link>
          <p className="mt-2 text-center text-[11px] text-secondary">
            Questions? Reach out anytime
          </p>
        </div>
      </div>
    </main>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <main className="flex min-h-screen flex-col items-center justify-center px-6 py-16">
        <p className="animate-pulse text-[11px] uppercase tracking-[0.3em] text-secondary">
          Loading...
        </p>
      </main>
    }>
      <SuccessContent />
    </Suspense>
  );
}
