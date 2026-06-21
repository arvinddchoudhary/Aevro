'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';
import {
  CheckoutFormErrors,
  CheckoutFormValues,
  createOrderPayload,
  validateCheckoutForm,
} from '../../lib/checkout';
import { createOrder } from '../../lib/api/orders';
import { createRazorpayOrder, verifyRazorpayPayment } from '../../lib/api/payments';
import { getUserAddresses } from '../../lib/api/users';
import { useAuth } from '../../lib/auth';
import { formatPrice } from '../../lib/format';
import { loadRazorpayScript, openRazorpayCheckout } from '../../lib/razorpay';
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
  const router = useRouter();
  const { status, user } = useAuth();
  const { items, subtotalInPaise, clearCart } = useCart();
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<CheckoutFormErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [pendingOrderId, setPendingOrderId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitLabel, setSubmitLabel] = useState('Pay with Razorpay');
  const stockBlockedItems = items.filter(
    (item) => item.stock <= 0 || item.quantity > item.stock,
  );
  const lowStockItems = items.filter(
    (item) => item.stock > 0 && item.stock <= 5,
  );

  useEffect(() => {
    async function loadDefaultAddress() {
      if (status !== 'authenticated' || !user) {
        return;
      }

      try {
        const addresses = await getUserAddresses();
        const defaultAddress = addresses.find((address) => address.isDefault);

        if (!defaultAddress) {
          setValues((currentValues) => ({
            ...currentValues,
            fullName: currentValues.fullName || user.name,
            email: currentValues.email || user.email,
            phone: currentValues.phone || user.phone || '',
          }));
          return;
        }

        setValues((currentValues) => ({
          ...currentValues,
          fullName: currentValues.fullName || defaultAddress.fullName,
          email: currentValues.email || user.email,
          phone: currentValues.phone || defaultAddress.phone,
          addressLine: currentValues.addressLine || [
            defaultAddress.addressLine1,
            defaultAddress.addressLine2,
          ]
            .filter(Boolean)
            .join(', '),
          city: currentValues.city || defaultAddress.city,
          state: currentValues.state || defaultAddress.state,
          postalCode: currentValues.postalCode || defaultAddress.postalCode,
          country: currentValues.country || defaultAddress.country,
        }));
      } catch {
        setValues((currentValues) => ({
          ...currentValues,
          fullName: currentValues.fullName || user.name,
          email: currentValues.email || user.email,
          phone: currentValues.phone || user.phone || '',
        }));
      }
    }

    void loadDefaultAddress();
  }, [status, user]);

  const updateValue = (name: keyof CheckoutFormValues, value: string) => {
    setValues((currentValues) => ({ ...currentValues, [name]: value }));
    setErrors((currentErrors) => ({ ...currentErrors, [name]: undefined }));
    setFormError(null);
    setPendingOrderId(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    const nextErrors = validateCheckoutForm(values);
    setErrors(nextErrors);

    if (stockBlockedItems.length > 0) {
      setFormError('Update your cart before checkout. One or more items exceed available stock.');
      return;
    }

    if (Object.keys(nextErrors).length > 0 || items.length === 0) {
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitLabel(pendingOrderId ? 'Opening Razorpay' : 'Creating order');
      const order = pendingOrderId
        ? null
        : await createOrder(createOrderPayload(values, items));
      const orderId = pendingOrderId ?? order?.id;

      if (!orderId) {
        throw new Error('Order could not be prepared for payment.');
      }

      setPendingOrderId(orderId);

      setSubmitLabel('Opening Razorpay');
      await loadRazorpayScript();
      const razorpayOrder = await createRazorpayOrder(orderId);

      openRazorpayCheckout({
        razorpayOrder,
        customer: order?.customer ?? {
          name: values.fullName,
          email: values.email,
          phone: values.phone,
        },
        onSuccess: async (response) => {
          setSubmitLabel('Verifying payment');

          try {
            await verifyRazorpayPayment({
              orderId,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });

            clearCart();
            router.push(`/checkout/confirmation/${orderId}`);
          } catch (error) {
            setIsSubmitting(false);
            setSubmitLabel('Retry payment');
            setFormError(
              error instanceof Error
                ? error.message
                : 'Payment verification failed.',
            );
          }
        },
        onFailure: (failureMessage) => {
          setIsSubmitting(false);
          setSubmitLabel('Retry payment');
          setFormError(failureMessage);
        },
        onDismiss: () => {
          setIsSubmitting(false);
          setSubmitLabel('Retry payment');
          setFormError('Payment was not completed. You can retry from this page.');
        },
      });
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : 'Unable to create order. Please try again.',
      );
      setSubmitLabel('Retry payment');
      setIsSubmitting(false);
    }
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

        {formError && (
          <div className="border border-[#8a1f1f] p-5 text-sm leading-6 text-[#8a1f1f] sm:p-6">
            <p>{formError}</p>
            {pendingOrderId && (
              <Link
                href={`/checkout/confirmation/${pendingOrderId}`}
                className="mt-3 inline-flex cursor-pointer underline underline-offset-4"
              >
                View pending order
              </Link>
            )}
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
              key={item.itemKey}
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
                {(item.selectedColor || item.selectedSize) && (
                  <p className="mt-2 text-xs leading-5 text-[#555555]">
                    {[item.selectedColor, item.selectedSize].filter(Boolean).join(' / ')}
                  </p>
                )}
                {item.stock <= 0 ? (
                  <p className="mt-2 text-xs leading-5 text-[#8a1f1f]">
                    Out of stock
                  </p>
                ) : item.quantity > item.stock ? (
                  <p className="mt-2 text-xs leading-5 text-[#8a1f1f]">
                    Only {item.stock} available
                  </p>
                ) : item.stock <= 5 ? (
                  <p className="mt-2 text-xs leading-5 text-[#8a1f1f]">
                    Only {item.stock} left
                  </p>
                ) : null}
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
          This creates a pending order and opens Razorpay checkout securely.
        </p>
        {lowStockItems.length > 0 && stockBlockedItems.length === 0 ? (
          <p className="mt-4 border border-[#8a1f1f] p-4 text-sm leading-6 text-[#8a1f1f]">
            Some selected variants are low in stock. Availability is checked again
            before payment opens.
          </p>
        ) : null}
        <button
          disabled={isSubmitting || stockBlockedItems.length > 0}
          className="mt-6 h-12 w-full cursor-pointer border border-[#111111] text-sm font-medium uppercase tracking-[0.08em] hover:bg-[#111111] hover:text-white disabled:cursor-not-allowed disabled:border-[#bdbdbd] disabled:text-[#777777] disabled:hover:bg-white"
        >
          {isSubmitting ? submitLabel : submitLabel}
        </button>
        <Link
          href="/cart"
          className="mt-3 inline-flex h-12 w-full cursor-pointer items-center justify-center border border-[#d9d9d9] text-sm font-medium uppercase tracking-[0.08em] hover:border-[#111111]"
        >
          Back to cart
        </Link>
      </aside>
    </form>
  );
}
