'use client';

import { useEffect, useMemo, useState } from 'react';
import { getCheckoutDeliveryEstimate, type DeliveryEstimate } from '../../lib/api/delivery-estimate';
import type { CartItem } from '../../lib/cart';

type CheckoutDeliveryEstimateProps = {
  postalCode: string;
  items: CartItem[];
};

function deliveryMessage(estimate: DeliveryEstimate) {
  if (!estimate.estimatedDeliveryStartDate || !estimate.estimatedDeliveryEndDate) {
    return estimate.message;
  }

  const start = new Date(estimate.estimatedDeliveryStartDate);
  const end = new Date(estimate.estimatedDeliveryEndDate);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return estimate.message;

  const formatter = new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
  });
  const startLabel = formatter.format(start);
  const endLabel = formatter.format(end);

  return startLabel === endLabel
    ? `Estimated delivery by ${startLabel}.`
    : `Estimated delivery between ${startLabel} and ${endLabel}.`;
}

export function CheckoutDeliveryEstimate({
  postalCode,
  items,
}: CheckoutDeliveryEstimateProps) {
  const [estimate, setEstimate] = useState<DeliveryEstimate | null>(null);
  const [loading, setLoading] = useState(false);
  const totalQuantity = items.reduce((total, item) => total + item.quantity, 0);
  const cartItems = useMemo(
    () => items.map((item) => ({
      productId: item.productId,
      ...(item.variantId ? { variantId: item.variantId } : {}),
      quantity: item.quantity,
    })),
    [items],
  );
  const cartKey = cartItems
    .map((item) => `${item.productId}:${item.variantId ?? ''}:${item.quantity}`)
    .sort()
    .join('|');

  useEffect(() => {
    if (!/^\d{6}$/.test(postalCode) || cartItems.length === 0) {
      setEstimate(null);
      setLoading(false);
      return;
    }

    if (totalQuantity > 4) {
      setEstimate({
        source: 'STANDARD',
        estimatedDeliveryStartDate: null,
        estimatedDeliveryEndDate: null,
        estimatedDeliveryDays: null,
        message: 'Estimated delivery: 7–10 business days.',
      });
      setLoading(false);
      return;
    }

    const timeout = window.setTimeout(() => {
      setLoading(true);
      void getCheckoutDeliveryEstimate(postalCode, cartItems)
        .then(setEstimate)
        .catch(() => {
          setEstimate({
            source: 'STANDARD',
            estimatedDeliveryStartDate: null,
            estimatedDeliveryEndDate: null,
            estimatedDeliveryDays: null,
            message: 'Estimated delivery: 7–10 business days.',
          });
        })
        .finally(() => setLoading(false));
    }, 350);

    return () => window.clearTimeout(timeout);
  }, [cartItems, cartKey, postalCode, totalQuantity]);

  if (!/^\d{6}$/.test(postalCode) || cartItems.length === 0) return null;

  return (
    <div className="mt-4 border border-[#ded4c8] bg-[#f8f4ed] px-4 py-3 text-sm text-[#2f2a25]" aria-live="polite">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#777067]">
        Delivery estimate
      </p>
      <p className="mt-1">{loading ? 'Checking delivery estimate…' : estimate ? deliveryMessage(estimate) : 'Checking delivery estimate…'}</p>
    </div>
  );
}
