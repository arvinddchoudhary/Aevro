import type { Metadata } from 'next';
import { CheckoutPageContent } from '../../components/checkout/CheckoutPageContent';
import { pageMetadata } from '../../lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Secure Checkout',
  description: 'Complete your AEVRO order through a secure checkout flow.',
  path: '/checkout',
  noIndex: true,
});

export default function CheckoutPage() {
  return (
    <main className="aevro-container min-h-screen py-8 sm:py-9">
      <div className="mb-6">
        <p className="mb-3 text-xs uppercase tracking-[0.16em] text-[#77716a]">
          Checkout
        </p>
        <h1 className="text-3xl font-light uppercase leading-none sm:text-4xl md:text-[2.9rem]">
          Customer details
        </h1>
        <p className="mt-3 text-sm text-[#514c45]">
          Secure checkout. Your details are safe with us.
        </p>
      </div>

      <CheckoutPageContent />
    </main>
  );
}
