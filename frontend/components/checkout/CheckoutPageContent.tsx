'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import {
  CheckoutFormErrors,
  CheckoutFormValues,
  CheckoutPayload,
  createCheckoutPayload,
  validateCheckoutForm,
} from '../../lib/checkout';
import { formatPrice } from '../../lib/format';
import { useCart } from '../../lib/cart';
import { EmptyState } from '../ui/EmptyState';

const initialValues: CheckoutFormValues = {
  fullName: '',
  email: '',
  phone: '',
  addressLine: '',
  city: '',
  state: '',
  postalCode: '',
  country: 'India',
};

type FieldProps = {
  label: string;
  name: keyof CheckoutFormValues;
  value: string;
  error?: string;
  autoComplete?: string;
  inputMode?: 'email' | 'tel' | 'text' | 'numeric';
  onChange: (name: keyof CheckoutFormValues, value: string) => void;
};

function CheckoutField({
  label,
  name,
  value,
  error,
  autoComplete,
  inputMode = 'text',
  onChange,
}: FieldProps) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs uppercase tracking-[0.16em] text-[#777777]">
        {label}
      </span>
      <input
        name={name}
        value={value}
        autoComplete={autoComplete}
        inputMode={inputMode}
        onChange={(event) => onChange(name, event.target.value)}
        className="h-11 w-full border border-[#d9d9d9] px-4 text-sm outline-none focus:border-[#111111]"
      />
      {error && <p className="mt-2 text-sm text-[#8a1f1f]">{error}</p>}
    </label>
  );
}

export function CheckoutPageContent() {
  const { items, subtotalInPaise } = useCart();
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<CheckoutFormErrors>({});
  const [payload, setPayload] = useState<CheckoutPayload | null>(null);

  const updateValue = (name: keyof CheckoutFormValues, value: string) => {
    setValues((currentValues) => ({ ...currentValues, [name]: value }));
    setErrors((currentErrors) => ({ ...currentErrors, [name]: undefined }));
    setPayload(null);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors = validateCheckoutForm(values);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0 || items.length === 0) {
      return;
    }

    setPayload(createCheckoutPayload(values, items, subtotalInPaise));
  };

  if (items.length === 0) {
    return (
      <EmptyState
        title="Cart required"
        message="Add products to your cart before starting checkout."
      />
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_380px]"
    >
      <section className="space-y-10">
        <div className="border border-[#e5e5e5] p-5 sm:p-6">
          <p className="mb-6 text-xs uppercase tracking-[0.2em] text-[#777777]">
            Customer details
          </p>
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <CheckoutField
                label="Full name"
                name="fullName"
                value={values.fullName}
                error={errors.fullName}
                autoComplete="name"
                onChange={updateValue}
              />
            </div>
            <CheckoutField
              label="Email"
              name="email"
              value={values.email}
              error={errors.email}
              autoComplete="email"
              inputMode="email"
              onChange={updateValue}
            />
            <CheckoutField
              label="Phone"
              name="phone"
              value={values.phone}
              error={errors.phone}
              autoComplete="tel"
              inputMode="tel"
              onChange={updateValue}
            />
          </div>
        </div>

        <div className="border border-[#e5e5e5] p-5 sm:p-6">
          <p className="mb-6 text-xs uppercase tracking-[0.2em] text-[#777777]">
            Shipping address
          </p>
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <CheckoutField
                label="Address line"
                name="addressLine"
                value={values.addressLine}
                error={errors.addressLine}
                autoComplete="street-address"
                onChange={updateValue}
              />
            </div>
            <CheckoutField
              label="City"
              name="city"
              value={values.city}
              error={errors.city}
              autoComplete="address-level2"
              onChange={updateValue}
            />
            <CheckoutField
              label="State"
              name="state"
              value={values.state}
              error={errors.state}
              autoComplete="address-level1"
              onChange={updateValue}
            />
            <CheckoutField
              label="Postal code"
              name="postalCode"
              value={values.postalCode}
              error={errors.postalCode}
              autoComplete="postal-code"
              inputMode="numeric"
              onChange={updateValue}
            />
            <CheckoutField
              label="Country"
              name="country"
              value={values.country}
              error={errors.country}
              autoComplete="country-name"
              onChange={updateValue}
            />
          </div>
        </div>

        {payload && (
          <div className="border border-[#e5e5e5] p-5 sm:p-6">
            <p className="text-xs uppercase tracking-[0.2em] text-[#777777]">
              Payload ready
            </p>
            <p className="mt-3 text-sm leading-6 text-[#555555]">
              Customer and cart data are ready for a future backend order API.
              No payment data is collected in this phase.
            </p>
            <pre className="mt-5 max-h-80 overflow-auto bg-[#f6f6f6] p-4 text-xs leading-6">
              {JSON.stringify(payload, null, 2)}
            </pre>
          </div>
        )}
      </section>

      <aside className="h-fit border border-[#e5e5e5] p-6">
        <p className="text-xs uppercase tracking-[0.2em] text-[#777777]">
          Order summary
        </p>
        <div className="mt-6 space-y-5">
          {items.map((item) => (
            <div
              key={item.productId}
              className="flex gap-4 border-b border-[#eeeeee] pb-5 last:border-b-0"
            >
              <div className="h-24 w-18 shrink-0 overflow-hidden bg-[#f5f5f5]">
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.imageAltText ?? item.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-[10px] uppercase tracking-[0.14em] text-[#777777]">
                    AEVRO
                  </div>
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm leading-5">{item.name}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.14em] text-[#777777]">
                  Qty {item.quantity}
                </p>
                <p className="mt-2 text-sm">
                  {formatPrice(item.priceInPaise * item.quantity)}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex items-center justify-between border-t border-[#e5e5e5] pt-5 text-lg">
          <span>Total</span>
          <span>{formatPrice(subtotalInPaise)}</span>
        </div>
        <p className="mt-4 text-sm leading-6 text-[#666666]">
          Payment and order creation will be connected in a later phase.
        </p>
        <button className="mt-6 h-12 w-full border border-[#111111] text-sm font-medium uppercase tracking-[0.08em] hover:bg-[#111111] hover:text-white">
          Prepare checkout
        </button>
        <Link
          href="/cart"
          className="mt-3 inline-flex h-12 w-full items-center justify-center border border-[#d9d9d9] text-sm font-medium uppercase tracking-[0.08em] hover:border-[#111111]"
        >
          Back to cart
        </Link>
      </aside>
    </form>
  );
}
