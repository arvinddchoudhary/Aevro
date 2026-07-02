'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { getAdminOrders } from '../../../lib/api/admin-orders';
import { formatPrice } from '../../../lib/format';
import type { AdminOrder } from '../../../types/admin/orders';
import { EmptyState } from '../../ui/EmptyState';
import { ErrorState } from '../../ui/ErrorState';
import { AdminIcon } from '../AdminIcons';

type CustomerSummary = {
  email: string;
  name: string;
  phone: string;
  orders: AdminOrder[];
  totalInPaise: number;
  latestOrder?: AdminOrder;
};

export function AdminCustomersPageContent() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadOrders() {
      try {
        setIsLoading(true);
        setError(null);
        const response = await getAdminOrders({ limit: 100 });
        setOrders(response.data);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Unable to load customers.');
      } finally {
        setIsLoading(false);
      }
    }

    void loadOrders();
  }, []);

  const customers = useMemo(() => {
    const byEmail = new Map<string, CustomerSummary>();

    orders.forEach((order) => {
      const email = order.customer.email;
      const current = byEmail.get(email);

      if (!current) {
        byEmail.set(email, {
          email,
          name: order.customer.name,
          phone: order.customer.phone,
          orders: [order],
          totalInPaise: order.totalInPaise,
          latestOrder: order,
        });
        return;
      }

      current.orders.push(order);
      current.totalInPaise += order.totalInPaise;

      if (
        !current.latestOrder ||
        new Date(order.createdAt) > new Date(current.latestOrder.createdAt)
      ) {
        current.latestOrder = order;
      }
    });

    return Array.from(byEmail.values()).sort((a, b) =>
      a.name.localeCompare(b.name),
    );
  }, [orders]);

  return (
    <section>
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#a56f3c]">
          Customer records
        </p>
        <h1 className="mt-4 font-serif text-5xl font-light leading-none text-[#111111] sm:text-6xl">
          Customers
        </h1>
        <p className="mt-6 max-w-2xl text-base leading-8 text-[#625a51]">
          Review customers derived from existing order history. Dedicated
          support tooling can build on this foundation later.
        </p>
      </div>

      {isLoading && <EmptyState title="Loading customers" message="Fetching order customers." />}
      {error && <ErrorState title="Customers unavailable" message={error} />}

      {!isLoading && !error && customers.length === 0 && (
        <EmptyState title="No customers yet" message="Customers will appear after orders are placed." />
      )}

      {!isLoading && !error && customers.length > 0 && (
        <div className="space-y-4">
          {customers.map((customer) => (
            <article
              key={customer.email}
              className="grid gap-5 rounded-[8px] border border-[#ddd4c8] bg-[#fffaf3]/84 p-5 shadow-[0_18px_70px_rgba(44,34,24,0.025)] lg:grid-cols-[minmax(0,1.2fr)_repeat(3,minmax(120px,auto))] lg:items-center"
            >
              <div className="flex min-w-0 gap-4">
                <span className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full bg-[#eee7dd] text-[#111111]">
                  <AdminIcon name="users" className="h-6 w-6" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-lg text-[#111111]">{customer.name}</p>
                  <p className="mt-1 truncate text-sm text-[#625a51]">
                    {customer.email}
                  </p>
                  <p className="mt-1 text-sm text-[#625a51]">{customer.phone}</p>
                </div>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-[#77716a]">
                  Orders
                </p>
                <p className="mt-2 font-serif text-2xl text-[#111111]">
                  {customer.orders.length}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-[#77716a]">
                  Spend
                </p>
                <p className="mt-2 font-serif text-2xl text-[#111111]">
                  {formatPrice(customer.totalInPaise)}
                </p>
              </div>
              <div className="lg:text-right">
                {customer.latestOrder ? (
                  <Link
                    href={`/admin/orders/${customer.latestOrder.id}`}
                    className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 border border-[#111111] px-4 text-sm transition hover:bg-[#111111] hover:text-[#fffaf3]"
                  >
                    Latest order
                    <AdminIcon name="arrow" className="h-4 w-4" />
                  </Link>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
