'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  getAdminOrder,
  updateAdminOrderStatus,
} from '../../../lib/api/admin-orders';
import { formatPrice } from '../../../lib/format';
import type { AdminOrder, AdminOrderStatus } from '../../../types/admin/orders';
import { EmptyState } from '../../ui/EmptyState';
import { ErrorState } from '../../ui/ErrorState';

const orderStatuses: AdminOrderStatus[] = [
  'PENDING',
  'CONFIRMED',
  'PROCESSING',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
];

export function AdminOrderDetailPageContent({ orderId }: { orderId: string }) {
  const [order, setOrder] = useState<AdminOrder | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<AdminOrderStatus>('PENDING');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    async function loadOrder() {
      try {
        setIsLoading(true);
        setError(null);
        const nextOrder = await getAdminOrder(orderId);
        setOrder(nextOrder);
        setSelectedStatus(nextOrder.status);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Unable to load order.');
      } finally {
        setIsLoading(false);
      }
    }

    void loadOrder();
  }, [orderId]);

  const saveStatus = async () => {
    if (!order || selectedStatus === order.status) {
      return;
    }

    try {
      setIsSaving(true);
      setError(null);
      setSuccess(null);
      const updatedOrder = await updateAdminOrderStatus(order.id, selectedStatus);
      setOrder(updatedOrder);
      setSelectedStatus(updatedOrder.status);
      setSuccess('Order status updated.');
    } catch (saveError) {
      setError(
        saveError instanceof Error ? saveError.message : 'Unable to update order status.',
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <EmptyState title="Loading order" message="Fetching order details." />;
  }

  if (error && !order) {
    return <ErrorState title="Order unavailable" message={error} />;
  }

  if (!order) {
    return <ErrorState title="Order unavailable" message="Order was not found." />;
  }

  return (
    <div>
      <div className="mb-8 flex flex-col gap-5 border-b border-[#ddd4c8] pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="mb-3 text-xs uppercase tracking-[0.22em] text-[#777777]">
            {order.orderNumber}
          </p>
          <h1 className="text-3xl font-light sm:text-4xl md:text-5xl">Order detail</h1>
          <p className="mt-4 text-sm text-[#5f5a53]">
            Created {new Date(order.createdAt).toLocaleString()}
          </p>
        </div>
        <Link
          href="/admin/orders"
          className="inline-flex h-11 w-full cursor-pointer items-center justify-center border border-[#ddd4c8] px-5 text-sm font-medium uppercase tracking-[0.08em] hover:border-[#111111] sm:w-auto"
        >
          Back to orders
        </Link>
      </div>

      <div className="grid gap-7 lg:grid-cols-[minmax(0,1fr)_340px] xl:grid-cols-[minmax(0,1fr)_360px]">
        <section className="space-y-6">
          <div className="border border-[#ddd4c8] p-4 sm:p-5">
            <p className="mb-4 text-xs uppercase tracking-[0.2em] text-[#777777]">
              Items
            </p>
            <div className="space-y-5">
              {order.items.map((item) => (
                <article
                  key={item.id}
                    className="grid gap-4 border-b border-[#e7ded2] pb-5 last:border-b-0 sm:grid-cols-[90px_1fr_auto]"
                >
                  <div className="aspect-[3/4] overflow-hidden bg-[#f5f5f5]">
                    {item.product?.images[0] ? (
                      <img
                        src={item.product.images[0].url}
                        alt={item.product.images[0].altText ?? item.productName}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs uppercase tracking-[0.18em] text-[#777777]">
                        AEVRO
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-base sm:text-lg">{item.productName}</p>
                    <p className="mt-2 text-sm text-[#5f5a53]">
                      {[item.selectedColor, item.selectedSize].filter(Boolean).join(' / ') ||
                        'No variant selected'}
                    </p>
                    <p className="mt-2 text-sm text-[#5f5a53]">
                      Qty {item.quantity} x {formatPrice(item.unitPriceInPaise)}
                    </p>
                  </div>
                  <p className="text-sm font-medium md:text-right">
                    {formatPrice(item.lineTotalInPaise)}
                  </p>
                </article>
              ))}
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="border border-[#ddd4c8] p-4 sm:p-5">
              <p className="mb-4 text-xs uppercase tracking-[0.2em] text-[#777777]">
                Customer
              </p>
              <p>{order.customer.name}</p>
              <p className="mt-2 text-sm text-[#5f5a53]">{order.customer.email}</p>
              <p className="mt-1 text-sm text-[#5f5a53]">{order.customer.phone}</p>
            </div>
            <div className="border border-[#ddd4c8] p-4 sm:p-5">
              <p className="mb-4 text-xs uppercase tracking-[0.2em] text-[#777777]">
                Shipping
              </p>
              <p className="text-sm leading-6 text-[#5f5a53]">
                {order.shippingAddress.addressLine}
                <br />
                {order.shippingAddress.city}, {order.shippingAddress.state}
                <br />
                {order.shippingAddress.postalCode}, {order.shippingAddress.country}
              </p>
            </div>
          </div>
        </section>

        <aside className="h-fit border border-[#ddd4c8] p-4 sm:p-5 lg:sticky lg:top-24">
          <p className="text-xs uppercase tracking-[0.2em] text-[#777777]">
            Manage order
          </p>
          <div className="mt-5 space-y-3 border-b border-[#e7ded2] pb-5 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-[#666666]">Total</span>
              <span>{formatPrice(order.totalInPaise)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-[#666666]">Payment</span>
              <span>{order.payment?.status ?? 'NO PAYMENT'}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-[#666666]">Updated</span>
              <span>{new Date(order.updatedAt).toLocaleDateString()}</span>
            </div>
          </div>

          <label className="mt-5 block">
            <span className="mb-2 block text-xs uppercase tracking-[0.16em] text-[#777777]">
              Order status
            </span>
            <select
              value={selectedStatus}
              onChange={(event) => setSelectedStatus(event.target.value as AdminOrderStatus)}
              className="h-11 w-full cursor-pointer border border-[#ddd4c8] bg-[#fffaf3] px-4 text-sm outline-none focus:border-[#111111]"
            >
              {orderStatuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>

          {error && (
            <p className="mt-4 border border-[#8a1f1f] p-4 text-sm leading-6 text-[#8a1f1f]">
              {error}
            </p>
          )}
          {success && (
            <p className="mt-4 border border-[#1f6b3a] p-4 text-sm leading-6 text-[#1f6b3a]">
              {success}
            </p>
          )}
          <button
            type="button"
            disabled={isSaving || selectedStatus === order.status}
            onClick={saveStatus}
            className="mt-5 h-12 w-full cursor-pointer border border-[#111111] text-sm font-medium uppercase tracking-[0.08em] hover:bg-[#111111] hover:text-[#fffaf3] disabled:cursor-not-allowed disabled:border-[#ddd4c8] disabled:text-[#777777] disabled:hover:bg-[#fffaf3]"
          >
            {isSaving ? 'Saving status' : 'Update status'}
          </button>
        </aside>
      </div>
    </div>
  );
}
