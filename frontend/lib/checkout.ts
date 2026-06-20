import type { CartItem } from './cart';

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

export type CheckoutPayload = {
  customer: CheckoutCustomer;
  shippingAddress: CheckoutShippingAddress;
  items: Array<{
    productId: string;
    slug: string;
    name: string;
    quantity: number;
    unitPriceInPaise: number;
    lineTotalInPaise: number;
  }>;
  subtotalInPaise: number;
  totalInPaise: number;
};

export type CheckoutFormValues = CheckoutCustomer & CheckoutShippingAddress;

export type CheckoutFormErrors = Partial<Record<keyof CheckoutFormValues, string>>;

export function createCheckoutPayload(
  values: CheckoutFormValues,
  items: CartItem[],
  subtotalInPaise: number,
): CheckoutPayload {
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
      slug: item.slug,
      name: item.name,
      quantity: item.quantity,
      unitPriceInPaise: item.priceInPaise,
      lineTotalInPaise: item.priceInPaise * item.quantity,
    })),
    subtotalInPaise,
    totalInPaise: subtotalInPaise,
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
