import { CartPageContent } from '../../components/cart/CartPageContent';

export default function CartPage() {
  return (
    <main className="aevro-container min-h-screen py-8 sm:py-10">
      <div className="mb-8 md:mb-10">
        <h1 className="text-4xl font-light uppercase leading-none md:text-5xl">
          Your bag
        </h1>
        <p className="mt-4 text-sm text-[#514c45]">
          Review your items and proceed to checkout.
        </p>
      </div>

      <CartPageContent />
    </main>
  );
}
