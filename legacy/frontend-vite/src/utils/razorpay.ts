import type { RazorpayOptions } from '../types';

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => { open: () => void };
  }
}

/**
 * Dynamically load the Razorpay checkout script.
 * Returns true on success, false on failure.
 */
export function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    // Already loaded
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

/**
 * Open the Razorpay checkout modal with the provided options.
 */
export function openRazorpayCheckout(options: RazorpayOptions): void {
  const rzp = new window.Razorpay(options);
  rzp.open();
}
