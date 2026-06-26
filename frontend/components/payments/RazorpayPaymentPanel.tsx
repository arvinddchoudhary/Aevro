'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  createPaymentIdempotencyKey,
  createRazorpayOrder,
  verifyRazorpayPayment,
} from '../../lib/api/payments';
import { formatPrice } from '../../lib/format';
import { loadRazorpayScript, openRazorpayCheckout } from '../../lib/razorpay';
import type { Order } from '../../types/orders';

type PaymentState = 'idle' | 'loading' | 'verifying' | 'paid' | 'failed';

export function RazorpayPaymentPanel({ order }: { order: Order }) {
  const router = useRouter();
  const [state, setState] = useState<PaymentState>(
    order.status === 'CONFIRMED' ? 'paid' : 'idle',
  );
  const [message, setMessage] = useState<string | null>(null);
  const [paymentIdempotencyKey, setPaymentIdempotencyKey] = useState(
    createPaymentIdempotencyKey,
  );

  const startPayment = async () => {
    setMessage(null);
    setState('loading');

    try {
      await loadRazorpayScript();
      const razorpayOrder = await createRazorpayOrder(
        order.id,
        paymentIdempotencyKey,
      );

      openRazorpayCheckout({
        razorpayOrder,
        customer: order.customer,
        onSuccess: async (response) => {
          setState('verifying');

          try {
            await verifyRazorpayPayment({
              orderId: order.id,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });

            setState('paid');
            setMessage('Payment verified. Your order is confirmed.');
            setPaymentIdempotencyKey(createPaymentIdempotencyKey());
            router.refresh();
          } catch (error) {
            setState('failed');
            setMessage(
              error instanceof Error
                ? error.message
                : 'Payment verification failed.',
            );
          }
        },
        onFailure: (failureMessage) => {
          setState('failed');
          setMessage(failureMessage);
        },
        onDismiss: () => {
          setState('idle');
        },
      });
    } catch (error) {
      setState('failed');
      setMessage(
        error instanceof Error
          ? error.message
          : 'Unable to start Razorpay payment.',
      );
    }
  };

  const isBusy = state === 'loading' || state === 'verifying';
  const isPaid = state === 'paid';

  return (
    <div className="mt-6 border border-[#111111] p-5">
      <p className="text-xs uppercase tracking-[0.2em] text-[#777777]">
        Payment
      </p>
      <div className="mt-4 flex items-center justify-between text-sm">
        <span>Amount due</span>
        <span>{formatPrice(order.totalInPaise)}</span>
      </div>
      <p className="mt-4 text-sm leading-6 text-[#5f5a53]">
        Razorpay checkout opens securely. AEVRO verifies the payment signature on
        the backend before confirming the order.
      </p>
      {message && (
        <p
          className={`mt-4 text-sm leading-6 ${
            isPaid ? 'text-[#1f6b3a]' : 'text-[#8a1f1f]'
          }`}
        >
          {message}
        </p>
      )}
      <button
        type="button"
        disabled={isBusy || isPaid}
        onClick={startPayment}
        className="mt-5 h-12 w-full border border-[#111111] text-sm font-medium uppercase tracking-[0.08em] hover:bg-[#111111] hover:text-[#fffaf3] disabled:cursor-not-allowed disabled:border-[#bdbdbd] disabled:text-[#777777] disabled:hover:bg-[#fffaf3]"
      >
        {state === 'loading'
          ? 'Starting payment'
          : state === 'verifying'
            ? 'Verifying payment'
            : isPaid
              ? 'Payment confirmed'
              : state === 'failed'
                ? 'Retry payment'
                : 'Pay with Razorpay'}
      </button>
    </div>
  );
}
