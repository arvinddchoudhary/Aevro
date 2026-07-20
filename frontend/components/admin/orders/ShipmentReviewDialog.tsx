'use client';

import { useMemo, useState } from 'react';
import { formatPrice } from '../../../lib/format';
import type { CreateShipmentPayload, ShipmentReview } from '../../../types/shipping';

type PackageFields = {
  weightKg: string;
  lengthCm: string;
  breadthCm: string;
  heightCm: string;
};

function recommendationFields(review: ShipmentReview): PackageFields {
  return {
    weightKg: review.recommendation.weightKg?.toFixed(2) ?? '',
    lengthCm: review.recommendation.lengthCm?.toString() ?? '',
    breadthCm: review.recommendation.breadthCm?.toString() ?? '',
    heightCm: review.recommendation.heightCm?.toString() ?? '',
  };
}

function packageError(value: string, min: number, max: number, label: string) {
  const numeric = Number(value);
  return Number.isFinite(numeric) && numeric >= min && numeric <= max
    ? null
    : `${label} must be between ${min} and ${max}.`;
}

export function ShipmentReviewDialog({
  review,
  submitting,
  onCancel,
  onConfirm,
}: {
  review: ShipmentReview;
  submitting: boolean;
  onCancel: () => void;
  onConfirm: (payload: CreateShipmentPayload) => Promise<void>;
}) {
  const [pickupLocation, setPickupLocation] = useState(
    review.pickupLocations.find((location) => location.name === review.defaultPickupLocation)?.name ??
      review.pickupLocations[0]?.name ??
      '',
  );
  const [fields, setFields] = useState<PackageFields>(() => recommendationFields(review));
  const [submitted, setSubmitted] = useState(false);

  const errors = useMemo(
    () => ({
      pickupLocation: pickupLocation ? null : 'Select a pickup location.',
      weightKg: packageError(fields.weightKg, 0.05, 30, 'Weight'),
      lengthCm: packageError(fields.lengthCm, 1, 200, 'Length'),
      breadthCm: packageError(fields.breadthCm, 1, 200, 'Breadth'),
      heightCm: packageError(fields.heightCm, 1, 200, 'Height'),
    }),
    [fields, pickupLocation],
  );
  const valid = Object.values(errors).every((error) => error === null);

  const updateField = (key: keyof PackageFields, value: string) => {
    setFields((current) => ({ ...current, [key]: value }));
  };

  const submit = async () => {
    setSubmitted(true);
    if (!valid) return;
    await onConfirm({
      pickupLocation,
      packageType: review.recommendation.packageType,
      weightKg: Number(fields.weightKg),
      lengthCm: Number(fields.lengthCm),
      breadthCm: Number(fields.breadthCm),
      heightCm: Number(fields.heightCm),
    });
  };

  const fieldClass = 'mt-1 h-11 w-full border border-[#ddd4c8] bg-[#fffaf3] px-3 text-sm outline-none focus:border-[#111111]';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#1b1510]/45 p-3 sm:p-6" role="presentation">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="shipment-review-title"
        className="mx-auto my-4 w-full max-w-4xl border border-[#ddd4c8] bg-[#fbf7f0] shadow-[0_24px_80px_rgba(27,21,16,0.28)]"
      >
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#ddd4c8] p-5 sm:p-7">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[#777777]">Shiprocket fulfilment</p>
            <h2 id="shipment-review-title" className="mt-2 text-2xl font-light sm:text-3xl">Create shipment review</h2>
          </div>
          <button type="button" onClick={onCancel} disabled={submitting} className="h-10 w-10 border border-[#ddd4c8] text-xl disabled:opacity-50" aria-label="Close shipment review">×</button>
        </div>

        <div className="grid gap-6 p-5 sm:p-7 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-6">
            <section>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#777777]">Order</p>
              <p className="mt-2 text-lg">{review.orderNumber}</p>
              <p className="mt-1 text-sm text-[#5f5a53]">Payment: {review.paymentStatus} · Status: {review.orderStatus}</p>
            </section>
            <section className="border-t border-[#ddd4c8] pt-5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#777777]">Delivery</p>
              <p className="mt-2 text-sm leading-6">{review.customer.name}<br />{review.customer.phone}<br />{review.customer.email}</p>
              <p className="mt-3 text-sm leading-6 text-[#5f5a53]">{review.customer.shippingAddress.addressLine1}<br />{review.customer.shippingAddress.city}, {review.customer.shippingAddress.state} {review.customer.shippingAddress.pincode}<br />{review.customer.shippingAddress.country}</p>
            </section>
            <section className="border-t border-[#ddd4c8] pt-5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#777777]">Ordered products</p>
              <div className="mt-3 divide-y divide-[#e7ded2]">
                {review.items.map((item, index) => (
                  <div key={`${item.sku}-${index}`} className="py-3 text-sm">
                    <div className="flex flex-wrap justify-between gap-2"><span className="font-medium">{item.name}</span><span>{formatPrice(item.unitPriceInPaise)}</span></div>
                    <p className="mt-1 text-xs leading-5 text-[#5f5a53]">SKU {item.sku} · {item.size ? `Size ${item.size}` : 'Size unavailable'} · {item.color ?? 'Colour unavailable'} · Qty {item.quantity}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="space-y-5 border-t border-[#ddd4c8] pt-5 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
            <section>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#777777]">Package recommendation</p>
              <p className="mt-2 text-lg">{review.recommendation.packageType} parcel · {review.totalQuantity} item{review.totalQuantity === 1 ? '' : 's'}</p>
              {review.recommendation.requiresManualDetails ? <p className="mt-2 text-sm leading-6 text-[#8a1f1f]">Manual package details required for orders above four items.</p> : <p className="mt-1 text-sm text-[#5f5a53]">{review.recommendation.lengthCm} × {review.recommendation.breadthCm} × {review.recommendation.heightCm} cm · {review.recommendation.weightKg?.toFixed(2)} kg</p>}
            </section>
            <section className="border-t border-[#ddd4c8] pt-5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#777777]">Final measured package</p>
              <div className="mt-3 grid grid-cols-2 gap-3">
                {([
                  ['weightKg', 'Weight (kg)'],
                  ['lengthCm', 'Length (cm)'],
                  ['breadthCm', 'Breadth (cm)'],
                  ['heightCm', 'Height (cm)'],
                ] as [keyof PackageFields, string][]).map(([key, label]) => (
                  <label key={key} className="block text-xs text-[#5f5a53]">{label}<input type="number" min="0" step="0.01" value={fields[key]} onChange={(event) => updateField(key, event.target.value)} className={fieldClass} aria-invalid={Boolean(submitted && errors[key])} />{submitted && errors[key] ? <span className="mt-1 block text-xs text-[#8a1f1f]">{errors[key]}</span> : null}</label>
                ))}
              </div>
              <button type="button" onClick={() => setFields(recommendationFields(review))} disabled={submitting || review.recommendation.requiresManualDetails} className="mt-3 text-xs uppercase tracking-[0.08em] underline underline-offset-4 disabled:opacity-40">Reset to recommendation</button>
            </section>
            <label className="block border-t border-[#ddd4c8] pt-5 text-xs font-semibold uppercase tracking-[0.16em] text-[#777777]">Pickup location<select value={pickupLocation} onChange={(event) => setPickupLocation(event.target.value)} className={fieldClass}>{review.pickupLocations.map((location) => <option key={location.name} value={location.name}>{location.name} — {location.pincode}</option>)}</select>{submitted && errors.pickupLocation ? <span className="mt-1 block normal-case tracking-normal text-[#8a1f1f]">{errors.pickupLocation}</span> : null}</label>
          </div>
        </div>
        <div className="flex flex-col-reverse gap-3 border-t border-[#ddd4c8] p-5 sm:flex-row sm:justify-end sm:p-7">
          <button type="button" onClick={onCancel} disabled={submitting} className="h-11 border border-[#111111] px-5 text-xs font-medium uppercase tracking-[0.08em] disabled:opacity-50">Cancel</button>
          <button type="button" onClick={() => void submit()} disabled={submitting} className="h-11 bg-[#111111] px-5 text-xs font-medium uppercase tracking-[0.08em] text-white disabled:cursor-not-allowed disabled:opacity-50">{submitting ? 'Creating shipment' : 'Confirm and create shipment'}</button>
        </div>
      </section>
    </div>
  );
}
