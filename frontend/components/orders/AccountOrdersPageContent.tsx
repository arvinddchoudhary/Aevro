'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getMyOrders } from '../../lib/api/orders';
import { useAuth } from '../../lib/auth';
import { formatPrice } from '../../lib/format';
import type { Order } from '../../types/orders';
import { EmptyState } from '../ui/EmptyState';
import { ErrorState } from '../ui/ErrorState';
import { OrderStatusPill } from './OrderStatusPill';

export function AccountOrdersPageContent() {
  const router = useRouter();
  const { status } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
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

    async function loadOrders() {
      setIsLoading(true);
      setError(null);

      const response = await getMyOrders();

      if (!response.success) {
        setError(
          Array.isArray(response.message)
            ? response.message.join(' ')
            : response.message,
        );
        setIsLoading(false);
        return;
      }

      setOrders(response.data);
      setIsLoading(false);
    }

    void loadOrders();
  }, [status]);

  if (status === 'loading' || isLoading) {
    return (
      <EmptyState
        title="Loading orders"
        message="Checking your AEVRO order history."
      />
    );
  }

  if (error) {
    return <ErrorState title="Orders unavailable" message={error} />;
  }

  if (orders.length === 0) {
    return (
      <EmptyState
        title="No orders yet"
        message="Your placed orders will appear here after checkout."
      />
    );
  }

  return (
    <section className="space-y-5">
      {orders.map((order) => (
        <Link
          key={order.id}
          href={`/account/orders/${order.id}`}
          className="grid gap-5 border border-[#ddd4c8] p-5 hover:border-[#111111] md:grid-cols-[1fr_auto]"
        >
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-xs uppercase tracking-[0.18em] text-[#777777]">
                {order.orderNumber}
              </p>
              <OrderStatusPill label={order.status} />
              <OrderStatusPill label={order.payment?.status ?? 'UNPAID'} />
            </div>
            <p className="mt-4 text-lg">
              {order.items.length} item{order.items.length === 1 ? '' : 's'}
            </p>
            <p className="mt-2 text-sm text-[#5f5a53]">
              Placed {new Date(order.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div className="text-left md:text-right">
            <p className="text-xs uppercase tracking-[0.18em] text-[#777777]">
              Total
            </p>
            <p className="mt-2 text-xl">{formatPrice(order.totalInPaise)}</p>
          </div>
        </Link>
      ))}
    </section>
  );
}
