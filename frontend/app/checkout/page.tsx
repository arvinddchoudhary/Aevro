import { CheckoutPageContent } from '../../components/checkout/CheckoutPageContent';

export default function CheckoutPage() {
  return (
    <main className="aevro-container min-h-screen py-14">
      <div className="mb-10">
        <p className="mb-3 text-xs uppercase tracking-[0.14em] text-[#77716a]">
          Checkout
        </p>
        <h1 className="text-5xl font-light uppercase leading-none md:text-6xl">
          Customer details
        </h1>
      </div>

      <CheckoutPageContent />
    </main>
  );
}
