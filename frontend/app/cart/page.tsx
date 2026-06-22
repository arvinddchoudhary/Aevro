import { CartPageContent } from '../../components/cart/CartPageContent';

export default function CartPage() {
  return (
    <main className="aevro-container min-h-screen py-14">
      <div className="mb-10 md:mb-14">
        <h1 className="text-5xl font-light uppercase leading-none tracking-[-0.02em] md:text-6xl">
          Your bag
        </h1>
        <p className="mt-5 text-sm text-[#514c45]">
          Review your items and proceed to checkout.
        </p>
      </div>

      <CartPageContent />
    </main>
  );
}
