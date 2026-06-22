'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getMyOrder } from '../../lib/api/orders';
import { useAuth } from '../../lib/auth';
import { formatPrice } from '../../lib/format';
import type { Order } from '../../types/orders';
import { EmptyState } from '../ui/EmptyState';
import { ErrorState } from '../ui/ErrorState';
import { OrderStatusPill } from './OrderStatusPill';

export function AccountOrderDetailsPageContent({ id }: { id: string }) {
  const router = useRouter();
  const { status } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login');
    }
  }, [router, status]);

  useEffect(() => {
    if (status !== 'authenticated') {
      return;
    }

    async function loadOrder() {
      setIsLoading(true);
      setError(null);

      const response = await getMyOrder(id);

      if (!response.success) {
        setError(
          Array.isArray(response.message)
            ? response.message.join(' ')
            : response.message,
        );
        setIsLoading(false);
        return;
      }

      setOrder(response.data);
      setIsLoading(false);
    }

    void loadOrder();
  }, [id, status]);

  if (status === 'loading' || isLoading) {
    return (
      <EmptyState
        title="Loading order"
        message="Checking this order belongs to your account."
      />
    );
  }

  if (error) {
    return <ErrorState title="Order unavailable" message={error} />;
  }

  if (!order) {
    return <EmptyState title="Order not found" message="This order is unavailable." />;
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_360px]">
      <section>
        <Link href="/account/orders" className="text-sm underline-offset-4 hover:underline">
          Back to orders
        </Link>
        <div className="mt-6 border-b border-[#ddd4c8] pb-8">
          <p className="text-xs uppercase tracking-[0.22em] text-[#777777]">
            {order.orderNumber}
          </p>
          <h1 className="mt-4 text-4xl font-light md:text-5xl">Order details</h1>
          <div className="mt-5 flex flex-wrap gap-3">
            <OrderStatusPill label={order.status} />
            <OrderStatusPill label={order.payment?.status ?? 'UNPAID'} />
          </div>
        </div>

        <div className="mt-8 space-y-5">
          {order.items.map((item) => {
            const image = item.product?.images[0];

            return (
              <article
                key={item.id}
                className="grid gap-5 border-b border-[#ddd4c8] pb-5 sm:grid-cols-[110px_1fr_auto]"
              >
                <div className="aspect-[3/4] overflow-hidden bg-[#f5f5f5]">
                  {image ? (
                    <img
                      src={image.url}
                      alt={image.altText ?? item.productName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs uppercase tracking-[0.18em] text-[#777777]">
                      AEVRO
                    </div>
                  )}
                </div>
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
            );
          })}
        </div>
      </section>

      <aside className="h-fit border border-[#ddd4c8] p-6">
        <p className="text-xs uppercase tracking-[0.2em] text-[#777777]">
          Summary
        </p>
        <div className="mt-6 space-y-4 border-b border-[#ddd4c8] pb-5 text-sm">
          <div className="flex justify-between">
            <span>Placed</span>
            <span>{new Date(order.createdAt).toLocaleDateString()}</span>
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
      </aside>
    </div>
  );
}
