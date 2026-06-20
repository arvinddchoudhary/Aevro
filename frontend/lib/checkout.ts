import type { CartItem } from './cart';
import type { CreateOrderPayload } from '../types/orders';

export type CheckoutCustomer = {
  fullName: string;
  email: string;
  phone: string;
};

export type CheckoutShippingAddress = {
  addressLine: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
};

export type CheckoutFormValues = CheckoutCustomer & CheckoutShippingAddress;

export type CheckoutFormErrors = Partial<Record<keyof CheckoutFormValues, string>>;

export function createOrderPayload(
  values: CheckoutFormValues,
  items: CartItem[],
): CreateOrderPayload {
  return {
    customer: {
      fullName: values.fullName.trim(),
      email: values.email.trim().toLowerCase(),
      phone: values.phone.trim(),
    },
    shippingAddress: {
      addressLine: values.addressLine.trim(),
      city: values.city.trim(),
      state: values.state.trim(),
      postalCode: values.postalCode.trim(),
      country: values.country.trim(),
    },
    items: items.map((item) => ({
      productId: item.productId,
      variantId: item.variantId,
      quantity: item.quantity,
    })),
  };
}

export function validateCheckoutForm(values: CheckoutFormValues) {
  const errors: CheckoutFormErrors = {};
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phonePattern = /^[0-9+\-\s()]{7,20}$/;

  if (!values.fullName.trim()) {
    errors.fullName = 'Full name is required.';
  }

  if (!emailPattern.test(values.email.trim())) {
    errors.email = 'Enter a valid email address.';
  }

  if (!phonePattern.test(values.phone.trim())) {
    errors.phone = 'Enter a valid phone number.';
  }

  if (!values.addressLine.trim()) {
    errors.addressLine = 'Address line is required.';
  }

  if (!values.city.trim()) {
    errors.city = 'City is required.';
  }

  if (!values.state.trim()) {
    errors.state = 'State is required.';
  }

  if (!values.postalCode.trim()) {
    errors.postalCode = 'Postal code is required.';
  }

  if (!values.country.trim()) {
    errors.country = 'Country is required.';
  }

  return errors;
}
