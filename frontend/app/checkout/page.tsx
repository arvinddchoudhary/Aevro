import { CheckoutPageContent } from '../../components/checkout/CheckoutPageContent';

export default function CheckoutPage() {
  return (
    <main className="mx-auto min-h-screen max-w-7xl px-5 py-12 sm:px-8">
      <div className="mb-10">
        <p className="mb-3 text-xs uppercase tracking-[0.22em] text-[#777777]">
          Checkout
        </p>
        <h1 className="text-4xl font-light md:text-5xl">Customer details</h1>
      </div>

      <CheckoutPageContent />
    </main>
  );
}
