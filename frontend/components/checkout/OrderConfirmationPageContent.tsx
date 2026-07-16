'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { getMyOrder } from '../../lib/api/orders';
import { formatPrice } from '../../lib/format';
import type { Order } from '../../types/orders';
import { RazorpayPaymentPanel } from '../payments/RazorpayPaymentPanel';
import { ErrorState } from '../ui/ErrorState';

type OrderConfirmationPageContentProps = {
  orderId: string;
};

type LoadState =
  | { status: 'loading' }
  | { status: 'success'; order: Order }
  | { status: 'error'; message: string };

export function OrderConfirmationPageContent({
  orderId,
}: OrderConfirmationPageContentProps) {
  const [state, setState] = useState<LoadState>({ status: 'loading' });

  const loadOrder = useCallback(async () => {
    setState({ status: 'loading' });
    const result = await getMyOrder(orderId);

    if (result.success) {
      setState({ status: 'success', order: result.data });
      return;
    }

    const message =
      result.statusCode === 401
        ? 'Your session expired. Sign in again to view this order.'
        : result.statusCode === 404
          ? 'This order was not found or does not belong to your account.'
          : 'The order could not be loaded. Please try again.';

    setState({ status: 'error', message });
  }, [orderId]);

  useEffect(() => {
    void loadOrder();
  }, [loadOrder]);

  if (state.status === 'loading') {
    return (
      <main className="mx-auto min-h-screen max-w-5xl px-5 py-12 sm:px-8">
        <div className="border border-[#ddd4c8] bg-[#fffaf3]/65 px-6 py-12 text-center">
          <p className="text-xs uppercase tracking-[0.18em] text-[#77716a]">
            Loading order
          </p>
          <p className="mt-3 text-sm leading-6 text-[#514c45]">
            Confirming your payment and order details.
          </p>
        </div>
      </main>
    );
  }

  if (state.status === 'error') {
    return (
      <main className="mx-auto min-h-screen max-w-5xl px-5 py-12 sm:px-8">
        <ErrorState title="Order unavailable" message={state.message} />
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={() => void loadOrder()}
            className="inline-flex h-11 cursor-pointer items-center justify-center bg-[#111111] px-6 text-xs font-medium uppercase tracking-[0.1em] text-[#fffaf3]"
          >
            Try again
          </button>
          <Link
            href="/login"
            className="inline-flex h-11 items-center justify-center border border-[#111111] px-6 text-xs font-medium uppercase tracking-[0.1em]"
          >
            Sign in
          </Link>
        </div>
      </main>
    );
  }

  const { order } = state;
  const isPending = order.status === 'PENDING';

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-5 py-12 sm:px-8">
      <div className="border-b border-[#ddd4c8] pb-8">
        <p className="mb-3 text-xs uppercase tracking-[0.22em] text-[#777777]">
          {isPending ? 'Order created' : 'Payment successful'}
        </p>
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div>
            <h1 className="text-4xl font-light md:text-5xl">
              {isPending
                ? 'Your pending order is ready.'
                : 'Your order is confirmed.'}
            </h1>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-[#5f5a53]">
              {isPending
                ? 'Complete payment securely to confirm your AEVRO order.'
                : 'Thank you for your order. We will share shipping updates as it moves toward you.'}
            </p>
          </div>
          <div className="border border-[#ddd4c8] px-5 py-4">
            <p className="text-xs uppercase tracking-[0.18em] text-[#777777]">
              Reference
            </p>
            <p className="mt-2 text-lg">{order.orderNumber}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-10 py-10 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section className="space-y-5">
          {order.items.map((item) => (
            <article
              key={item.id}
              className="grid gap-4 border-b border-[#ddd4c8] pb-5 sm:grid-cols-[1fr_auto]"
            >
              <div>
                {item.productSlug ? (
                  <Link
                    href={`/products/${item.productSlug}`}
                    className="text-lg underline-offset-4 hover:underline"
                  >
                    {item.productName}
                  </Link>
                ) : (
                  <p className="text-lg">{item.productName}</p>
                )}
                <p className="mt-2 text-xs uppercase tracking-[0.16em] text-[#777777]">
                  Qty {item.quantity}
                  {item.selectedColor ? ` / ${item.selectedColor}` : ''}
                  {item.selectedSize ? ` / ${item.selectedSize}` : ''}
                </p>
              </div>
              <div className="text-sm sm:text-right">
                <p className="text-[#777777]">
                  {formatPrice(item.unitPriceInPaise)} each
                </p>
                <p className="mt-1 font-medium">
                  {formatPrice(item.lineTotalInPaise)}
                </p>
              </div>
            </article>
          ))}
        </section>

        <aside className="h-fit border border-[#ddd4c8] p-6">
          <p className="text-xs uppercase tracking-[0.2em] text-[#777777]">
            Summary
          </p>
          <div className="mt-6 space-y-4 border-b border-[#ddd4c8] pb-5 text-sm">
            <div className="flex justify-between">
              <span>Status</span>
              <span>{order.status}</span>
            </div>
            <div className="flex justify-between">
              <span>Items</span>
              <span>{order.items.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Total</span>
              <span>{formatPrice(order.totalInPaise)}</span>
            </div>
          </div>

          <div className="mt-5 text-sm leading-7 text-[#5f5a53]">
            <p>{order.customer.name}</p>
            <p>{order.customer.email}</p>
            <p>{order.customer.phone}</p>
            <p className="mt-4">
              {order.shippingAddress.addressLine}, {order.shippingAddress.city},{' '}
              {order.shippingAddress.state} {order.shippingAddress.postalCode},{' '}
              {order.shippingAddress.country}
            </p>
          </div>

          {isPending && <RazorpayPaymentPanel order={order} />}

          <div className="mt-6 flex flex-col gap-3">
            <Link
              href="/products"
              className="inline-flex h-12 items-center justify-center border border-[#111111] px-6 text-sm font-medium uppercase tracking-[0.08em] hover:bg-[#111111] hover:text-[#fffaf3]"
            >
              Continue shopping
            </Link>
            <Link
              href="/account/orders"
              className="inline-flex h-12 items-center justify-center border border-[#ddd4c8] px-6 text-sm font-medium uppercase tracking-[0.08em] hover:border-[#111111]"
            >
              View my orders
            </Link>
          </div>
        </aside>
      </div>
    </main>
  );
}
