'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useState } from 'react';
import { getAdminOrders } from '../../../lib/api/admin-orders';
import { formatPrice } from '../../../lib/format';
import type {
  AdminOrder,
  AdminOrdersQuery,
  AdminOrderStatus,
  AdminPaymentStatus,
} from '../../../types/admin/orders';
import type { PaginationMeta } from '../../../types/catalog';
import { EmptyState } from '../../ui/EmptyState';
import { ErrorState } from '../../ui/ErrorState';

const orderStatuses: Array<AdminOrderStatus | ''> = [
  '',
  'PENDING',
  'CONFIRMED',
  'PROCESSING',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
];
const paymentStatuses: Array<AdminPaymentStatus | ''> = [
  '',
  'PENDING',
  'PAID',
  'FAILED',
  'REFUNDED',
];

export function AdminOrdersPageContent() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [query, setQuery] = useState<AdminOrdersQuery>({
    page: 1,
    limit: 20,
    sort: 'newest',
  });
  const [searchInput, setSearchInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadOrders() {
      try {
        setIsLoading(true);
        setError(null);
        const response = await getAdminOrders(query);
        setOrders(response.data);
        setMeta(response.meta);
      } catch (loadError) {
        setError(
          loadError instanceof Error ? loadError.message : 'Unable to load orders.',
        );
      } finally {
        setIsLoading(false);
      }
    }

    void loadOrders();
  }, [query]);

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setQuery((currentQuery) => ({
      ...currentQuery,
      page: 1,
      search: searchInput.trim() || undefined,
    }));
  };

  return (
    <div>
      <div className="mb-8 border-b border-[#e5e5e5] pb-6">
        <p className="mb-3 text-xs uppercase tracking-[0.22em] text-[#777777]">
          Admin
        </p>
        <h1 className="text-4xl font-light md:text-5xl">Orders</h1>
      </div>

      <div className="mb-8 border border-[#e5e5e5] p-5">
        <form onSubmit={submitSearch} className="grid gap-4 lg:grid-cols-[1fr_auto]">
          <input
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Search order id, name, or email"
            className="h-11 border border-[#d9d9d9] px-4 text-sm outline-none focus:border-[#111111]"
          />
          <button
            type="submit"
            className="h-11 cursor-pointer border border-[#111111] px-6 text-sm font-medium uppercase tracking-[0.08em] hover:bg-[#111111] hover:text-white"
          >
            Search
          </button>
        </form>

        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <select
            value={query.status ?? ''}
            onChange={(event) =>
              setQuery((currentQuery) => ({
                ...currentQuery,
                page: 1,
                status: (event.target.value || undefined) as AdminOrderStatus | undefined,
              }))
            }
            className="h-11 cursor-pointer border border-[#d9d9d9] bg-white px-4 text-sm outline-none focus:border-[#111111]"
          >
            {orderStatuses.map((status) => (
              <option key={status || 'all'} value={status}>
                {status || 'All order statuses'}
              </option>
            ))}
          </select>

          <select
            value={query.paymentStatus ?? ''}
            onChange={(event) =>
              setQuery((currentQuery) => ({
                ...currentQuery,
                page: 1,
                paymentStatus: (event.target.value || undefined) as
                  | AdminPaymentStatus
                  | undefined,
              }))
            }
            className="h-11 cursor-pointer border border-[#d9d9d9] bg-white px-4 text-sm outline-none focus:border-[#111111]"
          >
            {paymentStatuses.map((status) => (
              <option key={status || 'all'} value={status}>
                {status || 'All payment statuses'}
              </option>
            ))}
          </select>

          <select
            value={query.sort ?? 'newest'}
            onChange={(event) =>
              setQuery((currentQuery) => ({
                ...currentQuery,
                page: 1,
                sort: event.target.value as 'newest' | 'oldest',
              }))
            }
            className="h-11 cursor-pointer border border-[#d9d9d9] bg-white px-4 text-sm outline-none focus:border-[#111111]"
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
          </select>
        </div>
      </div>

      {isLoading && <EmptyState title="Loading orders" message="Fetching customer orders." />}
      {error && <ErrorState title="Orders unavailable" message={error} />}

      {!isLoading && !error && orders.length === 0 && (
        <EmptyState title="No orders found" message="No orders match the current filters." />
      )}

      {!isLoading && !error && orders.length > 0 && (
        <>
          <div className="space-y-4">
            {orders.map((order) => (
              <Link
                key={order.id}
                href={`/admin/orders/${order.id}`}
                className="grid cursor-pointer gap-5 border border-[#e5e5e5] bg-white p-5 transition hover:border-[#111111] lg:grid-cols-[1.2fr_1fr_auto]"
              >
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-[#777777]">
                    {order.orderNumber}
                  </p>
                  <p className="mt-3 text-lg">{order.customer.name}</p>
                  <p className="mt-1 text-sm text-[#555555]">{order.customer.email}</p>
                </div>
                <div className="flex flex-wrap items-start gap-2">
                  <span className="border border-[#d9d9d9] px-3 py-1 text-xs uppercase tracking-[0.14em]">
                    {order.status}
                  </span>
                  <span className="border border-[#d9d9d9] px-3 py-1 text-xs uppercase tracking-[0.14em]">
                    {order.payment?.status ?? 'NO PAYMENT'}
                  </span>
                  <span className="text-sm text-[#666666]">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="text-left lg:text-right">
                  <p className="text-lg">{formatPrice(order.totalInPaise)}</p>
                  <p className="mt-1 text-sm text-[#666666]">
                    {order.items.length} item{order.items.length === 1 ? '' : 's'}
                  </p>
                </div>
              </Link>
            ))}
          </div>

          {meta && (
            <div className="mt-8 flex items-center justify-between border-t border-[#e5e5e5] pt-5 text-sm">
              <button
                type="button"
                disabled={!meta.hasPreviousPage}
                onClick={() =>
                  setQuery((currentQuery) => ({
                    ...currentQuery,
                    page: Math.max(1, Number(currentQuery.page ?? 1) - 1),
                  }))
                }
                className="cursor-pointer disabled:cursor-not-allowed disabled:text-[#bbbbbb]"
              >
                Previous
              </button>
              <span>
                Page {meta.page} of {meta.totalPages || 1}
              </span>
              <button
                type="button"
                disabled={!meta.hasNextPage}
                onClick={() =>
                  setQuery((currentQuery) => ({
                    ...currentQuery,
                    page: Number(currentQuery.page ?? 1) + 1,
                  }))
                }
                className="cursor-pointer disabled:cursor-not-allowed disabled:text-[#bbbbbb]"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
