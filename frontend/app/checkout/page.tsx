import { CheckoutPageContent } from '../../components/checkout/CheckoutPageContent';

export default function CheckoutPage() {
  return (
    <main className="aevro-container min-h-screen py-9">
      <div className="mb-6">
        <p className="mb-3 text-xs uppercase tracking-[0.16em] text-[#77716a]">
          Checkout
        </p>
        <h1 className="text-4xl font-light uppercase leading-none tracking-[0.01em] md:text-[2.9rem]">
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
