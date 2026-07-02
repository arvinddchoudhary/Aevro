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
import { AdminIcon } from '../AdminIcons';
import {
  AdminOrderStatusBadge,
  AdminPaymentStatusBadge,
} from '../AdminStatusBadge';

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
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#a56f3c]">
          Order management
        </p>
        <h1 className="mt-4 font-serif text-5xl font-light leading-none text-[#111111] sm:text-6xl">
          Orders
        </h1>
        <p className="mt-6 max-w-2xl text-base leading-8 text-[#625a51]">
          View and manage all customer orders. Use filters to find specific
          orders or track their status.
        </p>
      </div>

      <div className="mb-6 rounded-[8px] border border-[#ddd4c8] bg-[#fffaf3]/84 p-5 shadow-[0_18px_70px_rgba(44,34,24,0.035)] sm:p-6">
        <form onSubmit={submitSearch} className="grid gap-4 xl:grid-cols-[1fr_auto]">
          <label className="relative block">
            <AdminIcon
              name="search"
              className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#8a8177]"
            />
            <input
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search order id, name, or email"
              className="h-[52px] w-full rounded-[4px] border border-[#ddd4c8] bg-[#fffdf8] pl-12 pr-4 text-sm outline-none focus:border-[#111111]"
            />
          </label>
          <button
            type="submit"
            className="h-[52px] cursor-pointer rounded-[4px] bg-[#111111] px-9 text-sm font-medium text-[#fffaf3] transition hover:bg-[#2d2924]"
            style={{ color: '#fffaf3' }}
          >
            Search
          </button>
        </form>

        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          <select
            value={query.status ?? ''}
            onChange={(event) =>
              setQuery((currentQuery) => ({
                ...currentQuery,
                page: 1,
                status: (event.target.value || undefined) as AdminOrderStatus | undefined,
              }))
            }
            className="h-[52px] cursor-pointer rounded-[4px] border border-[#ddd4c8] bg-[#fffdf8] px-4 text-sm outline-none focus:border-[#111111]"
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
            className="h-[52px] cursor-pointer rounded-[4px] border border-[#ddd4c8] bg-[#fffdf8] px-4 text-sm outline-none focus:border-[#111111]"
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
            className="h-[52px] cursor-pointer rounded-[4px] border border-[#ddd4c8] bg-[#fffdf8] px-4 text-sm outline-none focus:border-[#111111]"
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
                className="grid cursor-pointer gap-5 rounded-[8px] border border-[#ddd4c8] bg-[#fffaf3]/84 p-5 shadow-[0_18px_70px_rgba(44,34,24,0.025)] transition hover:border-[#c8bcae] hover:bg-[#fffdf8] lg:grid-cols-[minmax(0,1.15fr)_minmax(260px,0.85fr)_auto_24px] lg:items-center"
              >
                <div className="flex min-w-0 gap-4">
                  <span className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full bg-[#eee7dd] text-[#111111]">
                    <AdminIcon name="bag" className="h-6 w-6" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-xs uppercase tracking-[0.22em] text-[#777777]">
                      {order.orderNumber}
                    </p>
                    <p className="mt-3 truncate text-lg text-[#111111]">
                      {order.customer.name}
                    </p>
                    <p className="mt-1 truncate text-sm text-[#625a51]">
                      {order.customer.email}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <AdminOrderStatusBadge status={order.status} />
                    <AdminPaymentStatusBadge status={order.payment?.status} />
                  </div>
                  <span className="inline-flex items-center gap-2 text-sm text-[#625a51]">
                    <AdminIcon name="calendar" className="h-4 w-4" />
                    {new Date(order.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="text-left lg:text-right">
                  <p className="font-serif text-2xl text-[#111111]">
                    {formatPrice(order.totalInPaise)}
                  </p>
                  <p className="mt-2 text-sm text-[#625a51]">
                    {order.items.length} item{order.items.length === 1 ? '' : 's'}
                  </p>
                </div>

                <AdminIcon name="chevron" className="hidden h-5 w-5 text-[#625a51] lg:block" />
              </Link>
            ))}
          </div>

          {meta && (
            <div className="mt-8 flex items-center justify-between border-t border-[#ddd4c8] pt-5 text-sm">
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
