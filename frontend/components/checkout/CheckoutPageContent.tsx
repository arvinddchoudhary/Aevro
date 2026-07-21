'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useCallback, useEffect, useState } from 'react';
import {
  CheckoutFormErrors,
  CheckoutFormValues,
  createOrderPayload,
  validateCheckoutForm,
} from '../../lib/checkout';
import { createOrder } from '../../lib/api/orders';
import {
  createPaymentIdempotencyKey,
  createRazorpayOrder,
  verifyRazorpayPayment,
} from '../../lib/api/payments';
import { createUserAddress, getUserAddresses } from '../../lib/api/users';
import { useAuth } from '../../lib/auth';
import { formatPrice } from '../../lib/format';
import { loadRazorpayScript, openRazorpayCheckout } from '../../lib/razorpay';
import { useCart } from '../../lib/cart';
import type { UserAddress } from '../../types/user';
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
        className="h-10 w-full rounded-[4px] border border-[#ddd4c8] bg-[#fffaf3]/70 px-4 text-sm outline-none focus:border-[#111111]"
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
  const [savedAddresses, setSavedAddresses] = useState<UserAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState('new');
  const [saveAddress, setSaveAddress] = useState(false);
  const [addressLabel, setAddressLabel] = useState('Home');
  const [pendingOrderId, setPendingOrderId] = useState<string | null>(null);
  const [paymentIdempotencyKey, setPaymentIdempotencyKey] = useState(
    createPaymentIdempotencyKey,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitLabel, setSubmitLabel] = useState('Proceed to payment');
  const stockBlockedItems = items.filter(
    (item) => item.stock <= 0 || item.quantity > item.stock,
  );
  const lowStockItems = items.filter(
    (item) => item.stock > 0 && item.stock <= 5,
  );

  const applyAddress = useCallback((address: UserAddress) => {
    setValues((currentValues) => ({
      ...currentValues,
      fullName: address.fullName,
      email: currentValues.email || user?.email || '',
      phone: address.phone,
      addressLine: [address.addressLine1, address.addressLine2]
        .filter(Boolean)
        .join(', '),
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      country: address.country,
    }));
    setAddressLabel(address.label || 'Home');
    setSaveAddress(false);
  }, [user?.email]);

  useEffect(() => {
    async function loadDefaultAddress() {
      if (status !== 'authenticated' || !user) {
        return;
      }

      try {
        const addresses = await getUserAddresses();
        setSavedAddresses(addresses);
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

        setSelectedAddressId(defaultAddress.id);
        applyAddress(defaultAddress);
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
  }, [applyAddress, status, user]);

  const updateValue = (name: keyof CheckoutFormValues, value: string) => {
    setValues((currentValues) => ({ ...currentValues, [name]: value }));
    if (['fullName', 'phone', 'addressLine', 'city', 'state', 'postalCode', 'country'].includes(name)) {
      setSelectedAddressId('new');
    }
    setErrors((currentErrors) => ({ ...currentErrors, [name]: undefined }));
    setFormError(null);
    setPendingOrderId(null);
    setPaymentIdempotencyKey(createPaymentIdempotencyKey());
  };

  const handleAddressSelection = (addressId: string) => {
    setSelectedAddressId(addressId);
    setFormError(null);
    setPendingOrderId(null);
    setPaymentIdempotencyKey(createPaymentIdempotencyKey());

    if (addressId === 'new') {
      setSaveAddress(savedAddresses.length === 0);
      return;
    }

    const selectedAddress = savedAddresses.find((address) => address.id === addressId);
    if (selectedAddress) {
      applyAddress(selectedAddress);
    }
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
      if (status === 'authenticated' && selectedAddressId === 'new' && saveAddress) {
        await createUserAddress({
          label: addressLabel.trim() || 'Home',
          fullName: values.fullName,
          phone: values.phone,
          addressLine1: values.addressLine,
          city: values.city,
          state: values.state,
          postalCode: values.postalCode,
          country: values.country,
        });
        setSaveAddress(false);
      }

      setSubmitLabel(pendingOrderId ? 'Opening Razorpay' : 'Creating order');
      const order = pendingOrderId
        ? null
        : await createOrder({
            ...createOrderPayload(values, items),
            idempotencyKey: paymentIdempotencyKey,
          });
      const orderId = pendingOrderId ?? order?.id;

      if (!orderId) {
        throw new Error('Order could not be prepared for payment.');
      }

      setPendingOrderId(orderId);

      setSubmitLabel('Opening Razorpay');
      await loadRazorpayScript();
      const razorpayOrder = await createRazorpayOrder(
        orderId,
        paymentIdempotencyKey,
      );

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
            setPendingOrderId(null);
            setIsSubmitting(false);
            setPaymentIdempotencyKey(createPaymentIdempotencyKey());
            router.replace(`/checkout/confirmation/${orderId}`);
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

  if (status === 'loading') {
    return (
      <section className="border border-[#ddd4c8] bg-[#fffaf3]/65 p-6 sm:p-8">
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-[#77716a]">
          Checking session
        </p>
        <p className="mt-3 text-sm leading-6 text-[#514c45]">
          Preparing secure checkout.
        </p>
      </section>
    );
  }

  if (status !== 'authenticated') {
    return (
      <section className="grid gap-7 lg:grid-cols-[minmax(0,1fr)_380px] xl:grid-cols-[minmax(0,1fr)_410px]">
        <div className="border border-[#ddd4c8] bg-[#fffaf3]/65 p-6 sm:p-8">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-[#77716a]">
            Login required
          </p>
          <h2 className="mt-4 text-2xl font-light uppercase sm:text-3xl">
            Please login to place your order
          </h2>
          <p className="mt-4 max-w-xl text-sm leading-6 text-[#514c45]">
            Checkout is available only for signed-in customers. Your cart will stay
            ready while you login or verify a new account.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/login?redirect=%2Fcheckout"
              className="inline-flex h-11 shrink-0 items-center justify-center whitespace-nowrap bg-[#111111] px-6 text-xs font-semibold uppercase tracking-[0.12em] text-[#fffaf3] hover:bg-[#2a2825]"
              style={{ color: '#fffaf3' }}
            >
              <span className="text-[#fffaf3]">Login</span>
            </Link>
            <Link
              href="/register?redirect=%2Fcheckout"
              className="inline-flex h-11 items-center justify-center border border-[#111111] px-6 text-xs font-semibold uppercase tracking-[0.12em] hover:bg-[#111111] hover:text-[#fffaf3]"
            >
              Create account
            </Link>
          </div>
        </div>

        <aside className="h-fit border border-[#ddd4c8] bg-[#fffaf3]/75 p-4 sm:p-6">
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm font-medium uppercase tracking-[0.08em]">
              Order summary ({items.length})
            </p>
            <Link href="/cart" className="text-xs underline underline-offset-4">
              Edit Cart
            </Link>
          </div>
          <div className="mt-5 flex items-end justify-between border-t border-[#ddd4c8] pt-5 text-xl">
            <div>
              <p>Total</p>
              <p className="mt-1 text-xs text-[#514c45]">Inclusive of all taxes</p>
            </div>
            <span>{formatPrice(subtotalInPaise)}</span>
          </div>
        </aside>
      </section>
    );
  }

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="grid gap-7 lg:grid-cols-[minmax(0,1fr)_380px] xl:grid-cols-[minmax(0,1fr)_410px]"
      >
        <section className="overflow-hidden rounded-[8px] border border-[#ddd4c8] bg-[#fffaf3]/65 shadow-[0_18px_60px_rgba(17,17,17,0.035)]">
          <div className="p-4 sm:p-6 lg:p-7">
            <div className="mb-5 flex items-center justify-between border-b border-[#ddd4c8] pb-4">
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-[#514c45]">
                1. Contact information
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <CheckoutField
                label="Full name"
                name="fullName"
                value={values.fullName}
                error={errors.fullName}
                autoComplete="name"
                onChange={updateValue}
              />
              <div className="hidden border-b border-[#ddd4c8] md:block" aria-hidden="true" />
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

          <div className="border-t border-[#ddd4c8] p-4 sm:p-6 lg:p-7">
            <div className="mb-5 flex items-center justify-between border-b border-[#ddd4c8] pb-4">
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-[#514c45]">
                2. Shipping address
              </p>
            </div>
            {status === 'authenticated' && (
              <div className="mb-5 rounded-[6px] border border-[#e7ded2] bg-[#fffaf3]/60 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.14em] text-[#514c45]">
                      Saved addresses
                    </p>
                    <p className="mt-1 text-xs leading-5 text-[#777777]">
                      Choose a saved address or add a new one for this order.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleAddressSelection('new')}
                    className="h-9 cursor-pointer rounded-[4px] border border-[#111111] px-4 text-xs font-medium uppercase tracking-[0.1em] hover:bg-[#111111] hover:text-[#fffaf3]"
                  >
                    Add new
                  </button>
                </div>

                {savedAddresses.length > 0 ? (
                  <label className="mt-4 block">
                    <span className="mb-2 block text-xs uppercase tracking-[0.16em] text-[#777777]">
                      Select address
                    </span>
                    <select
                      value={selectedAddressId}
                      onChange={(event) => handleAddressSelection(event.target.value)}
                      className="h-10 w-full cursor-pointer rounded-[4px] border border-[#ddd4c8] bg-[#fffaf3] px-4 text-sm outline-none focus:border-[#111111]"
                    >
                      <option value="new">New address</option>
                      {savedAddresses.map((address) => (
                        <option key={address.id} value={address.id}>
                          {address.label} - {address.fullName}, {address.city}
                          {address.isDefault ? ' (Default)' : ''}
                        </option>
                      ))}
                    </select>
                  </label>
                ) : (
                  <p className="mt-4 text-xs leading-5 text-[#777777]">
                    No saved addresses yet. You can save this one for next time.
                  </p>
                )}

                {selectedAddressId === 'new' && (
                  <div className="mt-4 grid gap-3 border-t border-[#e7ded2] pt-4">
                    <label className="flex cursor-pointer items-center gap-3 text-sm text-[#514c45]">
                      <input
                        type="checkbox"
                        checked={saveAddress}
                        onChange={(event) => setSaveAddress(event.target.checked)}
                        className="h-4 w-4 cursor-pointer accent-[#111111]"
                      />
                      Save this address for future orders
                    </label>
                    {saveAddress && (
                      <label className="block">
                        <span className="mb-2 block text-xs uppercase tracking-[0.16em] text-[#777777]">
                          Address name
                        </span>
                        <input
                          value={addressLabel}
                          onChange={(event) => setAddressLabel(event.target.value)}
                          placeholder="Home, Office, Parents"
                          className="h-10 w-full rounded-[4px] border border-[#ddd4c8] bg-[#fffaf3] px-4 text-sm outline-none focus:border-[#111111]"
                        />
                      </label>
                    )}
                  </div>
                )}
              </div>
            )}
            <div className="grid gap-4 md:grid-cols-6">
              <div className="md:col-span-6">
                <CheckoutField
                  label="Address line"
                  name="addressLine"
                  value={values.addressLine}
                  error={errors.addressLine}
                  autoComplete="street-address"
                  onChange={updateValue}
                />
              </div>
              <div className="md:col-span-2">
                <CheckoutField
                  label="City"
                  name="city"
                  value={values.city}
                  error={errors.city}
                  autoComplete="address-level2"
                  onChange={updateValue}
                />
              </div>
              <div className="md:col-span-2">
                <CheckoutField
                  label="State"
                  name="state"
                  value={values.state}
                  error={errors.state}
                  autoComplete="address-level1"
                  onChange={updateValue}
                />
              </div>
              <div className="md:col-span-2">
                <CheckoutField
                  label="Pincode"
                  name="postalCode"
                  value={values.postalCode}
                  error={errors.postalCode}
                  autoComplete="postal-code"
                  inputMode="numeric"
                  onChange={updateValue}
                />
              </div>
              <div className="md:col-span-2">
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
            <p className="mt-6 border-t border-[#ddd4c8] pt-4 text-xs text-[#514c45]">
              All orders are processed securely.
            </p>
          </div>

          {formError && (
            <div className="border-t border-[#8a1f1f] p-5 text-sm leading-6 text-[#8a1f1f] sm:p-6">
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

        <aside className="h-fit rounded-[8px] border border-[#ddd4c8] bg-[#fffaf3]/75 p-4 shadow-[0_18px_60px_rgba(17,17,17,0.035)] sm:p-6 lg:sticky lg:top-24">
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm font-medium uppercase tracking-[0.08em]">
              Order summary ({items.length})
            </p>
            <Link href="/cart" className="text-xs underline underline-offset-4">
              Edit Cart
            </Link>
          </div>
          <div className="mt-6 space-y-4">
            {items.map((item) => (
              <div
                key={item.itemKey}
                className="grid grid-cols-[58px_minmax(0,1fr)] gap-3 border-b border-[#e7ded2] pb-4 last:border-b-0 min-[390px]:grid-cols-[58px_minmax(0,1fr)_auto] sm:gap-4"
              >
                <div className="h-[74px] overflow-hidden rounded-[3px] bg-[#f5f5f5]">
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
                <div className="min-w-0">
                  <p className="text-sm leading-5">{item.name}</p>
                  {(item.selectedColor || item.selectedSize) && (
                    <p className="mt-1 text-xs leading-5 text-[#5f5a53]">
                      {[item.selectedColor, item.selectedSize].filter(Boolean).join(' / ')}
                    </p>
                  )}
                  <p className="text-xs leading-5 text-[#5f5a53]">Qty: {item.quantity}</p>
                  {item.stock <= 0 ? (
                    <p className="mt-1 text-xs leading-5 text-[#8a1f1f]">
                      Out of stock
                    </p>
                  ) : item.quantity > item.stock ? (
                    <p className="mt-1 text-xs leading-5 text-[#8a1f1f]">
                      Requested quantity is unavailable
                    </p>
                  ) : item.stock <= 5 ? (
                    <p className="mt-1 text-xs leading-5 text-[#8a1f1f]">
                      Limited availability
                    </p>
                  ) : null}
                </div>
                <p className="col-span-2 text-right text-sm min-[390px]:col-span-1 min-[390px]:self-center">
                  {formatPrice(item.priceInPaise * item.quantity)}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-5 space-y-3 border-t border-[#ddd4c8] pt-5 text-sm">
            <div className="flex items-center justify-between">
              <span>Subtotal</span>
              <span>{formatPrice(subtotalInPaise)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Shipping</span>
              <span>Free</span>
            </div>
          </div>
          <div className="mt-5 flex items-end justify-between border-t border-[#ddd4c8] pt-5 text-xl">
            <div>
              <p>Total</p>
              <p className="mt-1 text-xs text-[#514c45]">Inclusive of all taxes</p>
            </div>
            <span>{formatPrice(subtotalInPaise)}</span>
          </div>
          {lowStockItems.length > 0 && stockBlockedItems.length === 0 ? (
            <p className="mt-4 border border-[#8a1f1f] p-3 text-xs leading-5 text-[#8a1f1f]">
              Some selected variants are low in stock. Availability is checked again
              before payment opens.
            </p>
          ) : null}
          <button
            disabled={isSubmitting || stockBlockedItems.length > 0}
            className="mt-5 h-11 w-full cursor-pointer rounded-[4px] bg-[#111111] text-xs font-semibold uppercase tracking-[0.12em] hover:bg-[#2a2825] disabled:cursor-not-allowed disabled:border disabled:border-[#ddd4c8] disabled:bg-transparent disabled:text-[#777777]"
            style={{ color: isSubmitting || stockBlockedItems.length > 0 ? undefined : '#fffaf3' }}
          >
            {isSubmitting ? submitLabel : submitLabel}
          </button>
          <Link
            href="/cart"
            className="mt-3 inline-flex h-11 w-full cursor-pointer items-center justify-center rounded-[4px] border border-[#111111] text-xs font-semibold uppercase tracking-[0.12em] hover:bg-[#111111] hover:text-[#fffaf3]"
          >
            Back to cart
          </Link>
        </aside>
      </form>

    </>
  );
}
