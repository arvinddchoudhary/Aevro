import type { RazorpayOrder } from '../types/payments';

const RAZORPAY_SCRIPT_URL = 'https://checkout.razorpay.com/v1/checkout.js';

type RazorpaySuccessResponse = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

type RazorpayFailureResponse = {
  error?: {
    description?: string;
  };
};

type RazorpayOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpaySuccessResponse) => void;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, string>;
  theme?: {
    color?: string;
  };
  modal?: {
    ondismiss?: () => void;
  };
};

type RazorpayInstance = {
  open: () => void;
  on: (
    event: 'payment.failed',
    handler: (response: RazorpayFailureResponse) => void,
  ) => void;
};

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

let razorpayScriptPromise: Promise<void> | null = null;

export function loadRazorpayScript() {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Razorpay can only load in the browser.'));
  }

  if (window.Razorpay) {
    return Promise.resolve();
  }

  if (razorpayScriptPromise) {
    return razorpayScriptPromise;
  }

  razorpayScriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = RAZORPAY_SCRIPT_URL;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Unable to load Razorpay checkout.'));
    document.body.appendChild(script);
  });

  return razorpayScriptPromise;
}

export function openRazorpayCheckout(input: {
  razorpayOrder: RazorpayOrder;
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  onSuccess: (response: RazorpaySuccessResponse) => void;
  onFailure: (message: string) => void;
  onDismiss: () => void;
}) {
  if (!window.Razorpay) {
    throw new Error('Razorpay checkout is not available.');
  }

  const checkout = new window.Razorpay({
    key: input.razorpayOrder.keyId,
    amount: input.razorpayOrder.amountInPaise,
    currency: input.razorpayOrder.currency,
    name: 'AEVRO',
    description: `Order ${input.razorpayOrder.orderNumber}`,
    order_id: input.razorpayOrder.razorpayOrderId,
    handler: input.onSuccess,
    prefill: {
      name: input.customer.name,
      email: input.customer.email,
      contact: input.customer.phone,
    },
    notes: {
      aevroOrderId: input.razorpayOrder.orderId,
      aevroOrderNumber: input.razorpayOrder.orderNumber,
    },
    theme: {
      color: '#111111',
    },
    modal: {
      ondismiss: input.onDismiss,
    },
  });

  checkout.on('payment.failed', (response) => {
    input.onFailure(response.error?.description ?? 'Payment failed.');
  });

  checkout.open();
}
