import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { getOrder } from '../services/order.service';
import { formatPrice } from '../utils/formatPrice';
import type { OrderResponse } from '../types';

export default function Success() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [orderData, setOrderData] = useState<OrderResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const orderId = searchParams.get('order_id');
    if (!orderId) {
      navigate('/');
      return;
    }

    getOrder(parseInt(orderId, 10))
      .then((data) => {
        setOrderData(data);
        setIsLoading(false);
      })
      .catch(() => {
        setIsLoading(false);
      });
  }, [searchParams, navigate]);

  /* ── Loading ── */
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="animate-pulse text-[13px] uppercase tracking-widest text-secondary">
          Processing...
        </p>
      </div>
    );
  }

  /* ── Fallback (no order data) ── */
  if (!orderData) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-8 py-16">
        <div className="mx-auto w-full max-w-[560px] text-center">
          <CheckCircle size={48} strokeWidth={1.2} className="mx-auto mb-6 text-text" />
          <h1 className="font-display mb-2 text-4xl font-light">Order Placed!</h1>
          <p className="mb-8 text-[13px] text-secondary">
            Your payment was successful. You will receive confirmation shortly.
          </p>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="flex h-12 w-full cursor-pointer items-center justify-center gap-2 bg-text text-[11px] uppercase tracking-[0.2em] text-white"
            style={{ border: 'none' }}
          >
            Continue shopping
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    );
  }

  /* ── Main success UI ── */
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-8 py-16">
      <div className="mx-auto w-full max-w-[560px] text-center">
        {/* Top */}
        <CheckCircle size={48} strokeWidth={1.2} className="mx-auto mb-6 text-text" />
        <p className="mb-3 text-[10px] uppercase tracking-[0.3em] text-secondary">
          Order confirmed
        </p>
        <h1 className="font-display mb-2 text-4xl font-light">Thank you.</h1>
        <p className="mb-8 text-[13px] text-secondary">
          Order{' '}
          <span className="font-medium text-text">{orderData.order_number}</span>
        </p>

        <div className="mb-8 h-px bg-border" />

        {/* What happens next */}
        <div className="mb-8 text-left">
          <h2 className="mb-6 text-[11px] uppercase tracking-[0.2em]">
            What happens next
          </h2>

          <div className="flex flex-col gap-5">
            {[
              {
                num: '1',
                title: 'Order received',
                desc: "We've received your order and payment. You'll get a confirmation on your phone shortly.",
              },
              {
                num: '2',
                title: 'Quality check',
                desc: 'Your trouser is inspected, folded, and packed with care before dispatch.',
              },
              {
                num: '3',
                title: 'Shipped to you',
                desc: 'Dispatched within 2–3 business days. Tracking details sent via WhatsApp.',
              },
            ].map((step) => (
              <div key={step.num} className="flex items-start gap-4">
                <span className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-text text-[10px] text-white">
                  {step.num}
                </span>
                <div>
                  <p className="mb-0.5 text-[13px] text-text">{step.title}</p>
                  <p className="text-[12px] leading-relaxed text-secondary">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-8 h-px bg-border" />

        {/* Order summary */}
        <div className="mb-8 text-left">
          <h2 className="mb-4 text-[11px] uppercase tracking-[0.2em]">
            Order details
          </h2>

          {[
            { label: 'Order number', value: orderData.order_number },
            {
              label: 'Payment',
              value: (
                <span className="flex items-center gap-1.5">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-green-500" />
                  Paid
                </span>
              ),
            },
            { label: 'Amount', value: formatPrice(orderData.total_amount) },
            {
              label: 'Status',
              value:
                orderData.order_status.charAt(0).toUpperCase() +
                orderData.order_status.slice(1),
            },
          ].map((row, i) => (
            <div
              key={i}
              className="flex justify-between border-b border-border py-2 text-[13px]"
            >
              <span className="text-secondary">{row.label}</span>
              <span className="text-text">{row.value}</span>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="mt-8 flex flex-col gap-3">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="flex h-12 w-full cursor-pointer items-center justify-center gap-2 bg-text text-[11px] uppercase tracking-[0.2em] text-white"
            style={{ border: 'none' }}
          >
            Continue shopping
            <ArrowRight size={16} />
          </button>
          <a
            href="https://wa.me/91XXXXXXXXXX"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 text-center text-[11px] tracking-wide text-secondary no-underline"
          >
            Questions? Contact us on WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
