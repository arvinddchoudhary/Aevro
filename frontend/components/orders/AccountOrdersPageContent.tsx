'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { AccountBenefitBar } from '../account/AccountBenefitBar';
import { AccountHero } from '../account/AccountHero';
import { AccountIcon } from '../account/AccountIcons';
import { AccountSidebar } from '../account/AccountSidebar';
import { getMyOrders } from '../../lib/api/orders';
import { useAuth } from '../../lib/auth';
import type { Order } from '../../types/orders';
import { EmptyState } from '../ui/EmptyState';
import { OrderRow } from './OrderRow';

type OrderFilter = 'ALL' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
type SortOrder = 'newest' | 'oldest';

const filterItems: Array<{ label: string; value: OrderFilter }> = [
  { label: 'All Orders', value: 'ALL' },
  { label: 'Processing', value: 'PROCESSING' },
  { label: 'Shipped', value: 'SHIPPED' },
  { label: 'Delivered', value: 'DELIVERED' },
  { label: 'Cancelled', value: 'CANCELLED' },
];

function matchesSearch(order: Order, query: string) {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return true;
  }

  const searchableText = [
    order.id,
    order.orderNumber,
    order.status,
    order.payment?.status,
    ...order.items.map((item) => item.productName),
    ...order.items.map((item) => item.product?.name ?? ''),
  ]
    .join(' ')
    .toLowerCase();

  return searchableText.includes(normalizedQuery);
}

function LoadingRows() {
  return (
    <div className="space-y-3">
      {[0, 1, 2].map((item) => (
        <div
          key={item}
          className="grid gap-5 border border-[#e1d8cc] bg-[#fffaf3]/80 p-5 xl:grid-cols-[190px_minmax(180px,1fr)_120px_120px_145px]"
        >
          <div className="flex gap-2">
            <span className="h-16 w-16 animate-pulse bg-[#eee5da]" />
            <span className="h-16 w-16 animate-pulse bg-[#eee5da]" />
          </div>
          <div>
            <span className="block h-4 w-40 animate-pulse bg-[#eee5da]" />
            <span className="mt-3 block h-3 w-24 animate-pulse bg-[#eee5da]" />
          </div>
          <span className="h-4 w-20 animate-pulse bg-[#eee5da]" />
          <span className="h-4 w-20 animate-pulse bg-[#eee5da]" />
          <span className="h-10 w-full animate-pulse bg-[#eee5da]" />
        </div>
      ))}
    </div>
  );
}

export function AccountOrdersPageContent() {
  const router = useRouter();
  const { logout, status, user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeFilter, setActiveFilter] = useState<OrderFilter>('ALL');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [query, setQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');

  const loadOrders = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const response = await getMyOrders();

    if (!response.success) {
      setError('We could not load your orders.');
      setIsLoading(false);
      return;
    }

    setOrders(response.data);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login');
    }
  }, [router, status]);

  useEffect(() => {
    if (status === 'authenticated') {
      void loadOrders();
    }
  }, [loadOrders, status]);

  const visibleOrders = useMemo(() => {
    return orders
      .filter((order) => activeFilter === 'ALL' || order.status === activeFilter)
      .filter((order) => matchesSearch(order, query))
      .sort((firstOrder, secondOrder) => {
        const firstDate = new Date(firstOrder.createdAt).getTime();
        const secondDate = new Date(secondOrder.createdAt).getTime();

        return sortOrder === 'newest' ? secondDate - firstDate : firstDate - secondDate;
      });
  }, [activeFilter, orders, query, sortOrder]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logout();
    setIsLoggingOut(false);
    router.replace('/login');
    router.refresh();
  };

  if (status === 'loading') {
    return <EmptyState title="Loading orders" message="Checking your AEVRO session." />;
  }

  if (!user) {
    return <EmptyState title="Login required" message="Redirecting you to login." />;
  }

  return (
    <div className="bg-[#fbf7f0]">
      <AccountHero
        title="My Orders"
        breadcrumb={[
          { label: 'Home', href: '/' },
          { label: 'Orders' },
        ]}
      />

      <section className="aevro-container py-3 sm:py-8 lg:py-10">
        <div className="grid gap-3 sm:gap-6 lg:grid-cols-[280px_minmax(0,1fr)] xl:grid-cols-[315px_minmax(0,1fr)]">
          <AccountSidebar isLoggingOut={isLoggingOut} onLogout={handleLogout} />

          <section className="min-w-0 overflow-hidden rounded-[8px] border border-[#e1d8cc] bg-[#fffaf3]/82 shadow-[0_20px_60px_rgba(48,38,27,0.04)] lg:rounded-none">
            <div className="grid gap-4 border-b border-[#e5dbcf] p-4 sm:gap-5 sm:p-7 lg:grid-cols-[1fr_minmax(260px,360px)] lg:items-center">
              <div className="flex items-center gap-4 sm:gap-5">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#f0e8de] text-[#211d18] sm:h-16 sm:w-16">
                  <AccountIcon name="bag" className="h-6 w-6 sm:h-8 sm:w-8" />
                </span>
                <div className="min-w-0">
                  <h1 className="font-serif text-2xl font-light text-[#111111] sm:text-3xl">
                    Your Orders
                  </h1>
                  <p className="mt-2 text-sm leading-6 text-[#625a51]">
                    Track, manage and view details of your recent purchases.
                  </p>
                </div>
              </div>

              <label className="relative block">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#514c45]">
                  <AccountIcon name="search" className="h-5 w-5" />
                </span>
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search by order ID or product"
                  className="h-12 w-full border border-[#ddd4c8] bg-[#fffdf8] pl-12 pr-4 text-sm outline-none transition placeholder:text-[#8a8177] focus:border-[#111111]"
                />
              </label>
            </div>

            <div className="grid gap-3 border-b border-[#e5dbcf] p-4 sm:gap-4 sm:p-7 xl:grid-cols-[1fr_180px] xl:items-center">
              <div className="grid grid-cols-2 gap-2 min-[390px]:grid-cols-4 sm:flex sm:flex-wrap">
                {filterItems.map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setActiveFilter(item.value)}
                    className={`h-10 min-w-0 border px-2 text-xs font-medium transition sm:shrink-0 sm:px-4 ${
                      activeFilter === item.value
                        ? 'border-[#eee5da] bg-[#eee5da] text-[#111111]'
                        : 'border-[#ddd4c8] bg-[#fffdf8] text-[#2f2a25] hover:border-[#111111]'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <label className="relative">
                <span className="sr-only">Sort orders</span>
                <select
                  value={sortOrder}
                  onChange={(event) => setSortOrder(event.target.value as SortOrder)}
                  className="h-11 w-full appearance-none border border-[#ddd4c8] bg-[#fffdf8] px-4 pr-10 text-sm outline-none transition focus:border-[#111111]"
                >
                  <option value="newest">Sort by: Newest</option>
                  <option value="oldest">Sort by: Oldest</option>
                </select>
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
                  <AccountIcon name="chevron" className="h-4 w-4" />
                </span>
              </label>
            </div>

            <div className="p-4 sm:p-7">
              {isLoading && <LoadingRows />}

              {error && !isLoading && (
                <div className="rounded-[6px] border border-[#e5dbcf] bg-[#fffdf8] p-6 text-center sm:p-10">
                  <h2 className="font-serif text-2xl font-light text-[#111111]">
                    We could not load your orders.
                  </h2>
                  <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#625a51]">
                    Try again.
                  </p>
                  <button
                    type="button"
                    onClick={() => void loadOrders()}
                    className="mt-6 inline-flex h-12 items-center justify-center bg-[#111111] px-6 text-sm font-medium uppercase tracking-[0.08em] text-[#fffaf3] transition hover:bg-[#2d2924]"
                    style={{ color: '#fffaf3' }}
                  >
                    Retry
                  </button>
                </div>
              )}

              {!isLoading && !error && orders.length === 0 && (
                <div className="border border-[#e5dbcf] bg-[#fffdf8] p-8 text-center sm:p-10">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#f0e8de] text-[#211d18]">
                    <AccountIcon name="bag" className="h-8 w-8" />
                  </div>
                  <h2 className="mt-5 font-serif text-2xl font-light text-[#111111]">
                    No orders yet.
                  </h2>
                  <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#625a51]">
                    Your AEVRO orders will appear here after checkout.
                  </p>
                  <Link
                    href="/products"
                    className="mt-5 inline-flex h-11 w-full items-center justify-center rounded-[3px] bg-[#111111] px-5 text-xs font-medium uppercase tracking-[0.1em] text-[#fffaf3] transition hover:bg-[#2d2924] sm:mt-6 sm:h-12 sm:w-auto sm:px-6 sm:text-sm"
                    style={{ color: '#fffaf3' }}
                  >
                    Start Shopping
                  </Link>
                </div>
              )}

              {!isLoading && !error && orders.length > 0 && visibleOrders.length === 0 && (
                <div className="border border-[#e5dbcf] bg-[#fffdf8] p-8 text-center sm:p-10">
                  <h2 className="font-serif text-2xl font-light text-[#111111]">
                    No matching orders.
                  </h2>
                  <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#625a51]">
                    Adjust your search or filter to view more orders.
                  </p>
                </div>
              )}

              {!isLoading && !error && visibleOrders.length > 0 && (
                <div className="space-y-3">
                  {visibleOrders.map((order) => (
                    <OrderRow key={order.id} order={order} />
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      </section>

      <AccountBenefitBar />
    </div>
  );
}
