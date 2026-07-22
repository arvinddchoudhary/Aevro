'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { getMyOrder } from '../../lib/api/orders';
import { formatPrice } from '../../lib/format';
import type { Order } from '../../types/orders';
import { RazorpayPaymentPanel } from '../payments/RazorpayPaymentPanel';
import { ErrorState } from '../ui/ErrorState';
import { CloudinaryProductImage } from '../products/CloudinaryProductImage';

type OrderConfirmationPageContentProps = {
  orderId: string;
};

type LoadState =
  | { status: 'loading' }
  | { status: 'success'; order: Order }
  | { status: 'error'; message: string };

const pageBackground = {
  backgroundImage:
    "url('/images/Order-Confirmation-Page/Order-Confirmation-background.png')",
};

export function OrderConfirmationPageContent({
  orderId,
}: OrderConfirmationPageContentProps) {
  const [state, setState] = useState<LoadState>({ status: 'loading' });
  const [copied, setCopied] = useState(false);

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
      <main
        className="min-h-[calc(100vh-72px)] bg-[#fffaf3] bg-cover bg-center bg-no-repeat px-5 py-12 sm:px-8"
        style={pageBackground}
      >
        <div className="mx-auto max-w-5xl border border-[#ddd4c8] bg-[#fffaf3]/85 px-6 py-12 text-center backdrop-blur-[2px]">
          <p className="text-xs uppercase tracking-[0.22em] text-[#77716a]">
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
      <main
        className="min-h-[calc(100vh-72px)] bg-[#fffaf3] bg-cover bg-center bg-no-repeat px-5 py-12 sm:px-8"
        style={pageBackground}
      >
        <div className="mx-auto max-w-5xl bg-[#fffaf3]/85 p-5 backdrop-blur-[2px] sm:p-8">
          <ErrorState title="Order unavailable" message={state.message} />
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={() => void loadOrder()}
              className="inline-flex h-11 cursor-pointer items-center justify-center bg-[#111111] px-6 text-xs font-medium uppercase tracking-[0.12em] text-[#fffaf3]"
            >
              Try again
            </button>
            <Link
              href="/login"
              className="inline-flex h-11 items-center justify-center border border-[#111111] px-6 text-xs font-medium uppercase tracking-[0.12em]"
            >
              Sign in
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const { order } = state;
  const isPending = order.status === 'PENDING';
  const itemCount = order.items.reduce((total, item) => total + item.quantity, 0);

  const copyReference = async () => {
    try {
      await navigator.clipboard.writeText(order.orderNumber);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  return (
    <main
      className="min-h-[calc(100vh-72px)] overflow-hidden bg-[#fffaf3] bg-cover bg-center bg-no-repeat px-4 py-7 text-[#111111] sm:px-8 sm:py-10 lg:px-12 lg:py-14"
      style={pageBackground}
    >
      <div className="mx-auto grid w-full max-w-[1400px] gap-8 lg:grid-cols-[minmax(0,1fr)_390px] lg:items-start lg:gap-12 xl:gap-20">
        <section className="min-w-0 lg:pt-10">
          <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
            <div
              className={`flex h-[70px] w-[70px] items-center justify-center rounded-full border ${
                isPending ? 'border-[#9c9183]' : 'border-[#c7a96a]'
              } sm:h-[78px] sm:w-[78px]`}
              aria-hidden="true"
            >
              <span
                className={`flex h-[56px] w-[56px] items-center justify-center rounded-full border ${
                  isPending ? 'border-[#b8ada0]' : 'border-[#d4bd89]'
                } sm:h-[64px] sm:w-[64px]`}
              >
                {isPending ? (
                  <span className="h-2.5 w-2.5 rounded-full bg-[#9c9183]" />
                ) : (
                  <span className="h-3 w-7 -translate-y-1 rotate-[-45deg] border-b-2 border-l-2 border-[#b99a5e]" />
                )}
              </span>
            </div>

            <p className="mt-8 text-[11px] font-medium uppercase tracking-[0.34em] text-[#948c82] sm:text-xs">
              {isPending ? 'Payment pending' : 'Payment successful'}
            </p>
            <h1 className="mt-6 font-serif text-[2.15rem] font-normal leading-[1.05] sm:text-5xl lg:text-[3.25rem]">
              {isPending ? 'Your order is awaiting payment.' : 'Your order is confirmed.'}
            </h1>
            <span className="mt-8 h-px w-14 bg-[#c5a96d]" aria-hidden="true" />
            <p className="mt-8 max-w-2xl text-sm leading-7 text-[#625c55] sm:text-base">
              {isPending
                ? 'Complete payment securely to confirm your AEVRO order.'
                : 'Thank you for your order. We will share shipping updates as it moves toward you.'}
            </p>
          </div>

          <div className="mt-10 space-y-4 lg:mt-14">
            {order.items.map((item) => {
              const image = item.product?.images[0];

              return (
                <article
                  key={item.id}
                  className="grid min-w-0 gap-5 rounded-[5px] border border-[#ddd4c8] bg-[#fffaf3]/78 p-4 shadow-[0_14px_45px_rgba(72,57,39,0.04)] backdrop-blur-[2px] sm:grid-cols-[112px_minmax(0,1fr)_auto] sm:items-center sm:p-6"
                >
                  <div className="relative h-[136px] w-[104px] overflow-hidden rounded-[4px] bg-[#ebe2d7] sm:h-[140px] sm:w-[112px]">
                    {image ? (
                      <CloudinaryProductImage
                        src={image.url}
                        alt={image.altText ?? item.productName}
                        delivery="thumbnail"
                        sizes="(max-width: 639px) 104px, 112px"
                        className="object-cover object-top"
                      />
                    ) : (
                      <span className="flex h-full items-center justify-center px-3 text-center text-[10px] uppercase tracking-[0.16em] text-[#8d847a]">
                        AEVRO
                      </span>
                    )}
                  </div>

                  <div className="min-w-0">
                    {item.productSlug ? (
                      <Link
                        href={`/products/${item.productSlug}`}
                        className="text-lg underline-offset-4 hover:underline sm:text-xl"
                      >
                        {item.productName}
                      </Link>
                    ) : (
                      <p className="text-lg sm:text-xl">{item.productName}</p>
                    )}
                    <p className="mt-4 text-[11px] uppercase tracking-[0.18em] text-[#77716a] sm:text-xs">
                      Qty {item.quantity}
                      {item.selectedColor ? ` / ${item.selectedColor}` : ''}
                      {item.selectedSize ? ` / ${item.selectedSize}` : ''}
                    </p>
                  </div>

                  <div className="text-sm sm:min-w-[126px] sm:text-right">
                    <p className="text-[#77716a]">
                      {formatPrice(item.unitPriceInPaise)} each
                    </p>
                    <p className="mt-3 font-medium text-[#111111]">
                      {formatPrice(item.lineTotalInPaise)}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <aside className="h-fit rounded-[8px] border border-[#ddd4c8] bg-[#fffaf3]/82 p-5 shadow-[0_18px_60px_rgba(72,57,39,0.05)] backdrop-blur-[3px] sm:p-7 lg:p-8">
          <p className="text-xs uppercase tracking-[0.22em] text-[#8b837a]">
            Reference
          </p>
          <button
            type="button"
            onClick={() => void copyReference()}
            className="mt-5 flex min-h-16 w-full cursor-pointer items-center justify-between gap-4 border border-[#d8cfc3] bg-[#fffaf3]/55 px-5 text-left text-sm transition hover:border-[#9b9186]"
            aria-label={`Copy order reference ${order.orderNumber}`}
          >
            <span className="min-w-0 break-all font-medium tracking-[0.03em]">
              {order.orderNumber}
            </span>
            <span className="relative h-5 w-5 shrink-0" aria-hidden="true">
              <span className="absolute left-1 top-0 h-3.5 w-3.5 rounded-[2px] border border-[#625c55]" />
              <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-[2px] border border-[#625c55] bg-[#fffaf3]" />
            </span>
          </button>
          <p className="mt-2 h-4 text-right text-[10px] uppercase tracking-[0.14em] text-[#77716a]" aria-live="polite">
            {copied ? 'Copied' : ''}
          </p>

          <div className="mt-5 border-t border-[#d8cfc3] pt-8">
            <p className="text-xs font-semibold uppercase tracking-[0.18em]">
              Summary
            </p>
            <dl className="mt-8 space-y-6 border-b border-[#d8cfc3] pb-8 text-sm">
              <div className="flex items-center justify-between gap-5">
                <dt>Status</dt>
                <dd className="uppercase">{order.status}</dd>
              </div>
              <div className="flex items-center justify-between gap-5">
                <dt>Items</dt>
                <dd>{itemCount}</dd>
              </div>
              <div className="flex items-center justify-between gap-5">
                <dt>Total</dt>
                <dd className="font-medium">{formatPrice(order.totalInPaise)}</dd>
              </div>
            </dl>
          </div>

          <address className="mt-7 not-italic text-sm leading-7 text-[#69625b]">
            <p className="font-medium text-[#111111]">{order.customer.name}</p>
            <p className="break-all">{order.customer.email}</p>
            <p>{order.customer.phone}</p>
            <p className="mt-5">
              {order.shippingAddress.addressLine}, {order.shippingAddress.city},{' '}
              {order.shippingAddress.state} {order.shippingAddress.postalCode},{' '}
              {order.shippingAddress.country}
            </p>
          </address>

          {isPending && <RazorpayPaymentPanel order={order} />}

          <div className="mt-8 flex flex-col gap-3">
            <Link
              href="/products"
              className="inline-flex h-14 items-center justify-center bg-[#111111] px-6 text-xs font-semibold uppercase tracking-[0.18em] text-[#fffaf3] transition hover:bg-[#2d2924]"
              style={{ color: '#fffaf3' }}
            >
              Continue shopping
            </Link>
            <Link
              href="/account/orders"
              className="inline-flex h-14 items-center justify-center border border-[#9b9186] bg-[#fffaf3]/35 px-6 text-xs font-semibold uppercase tracking-[0.18em] transition hover:bg-[#fffaf3]"
            >
              View my orders
            </Link>
          </div>
        </aside>
      </div>
    </main>
  );
}
