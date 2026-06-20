import { CartPageContent } from '../../components/cart/CartPageContent';

export default function CartPage() {
  return (
    <main className="mx-auto min-h-screen max-w-7xl px-5 py-12 sm:px-8">
      <div className="mb-10">
        <p className="mb-3 text-xs uppercase tracking-[0.22em] text-[#777777]">
          Bag
        </p>
        <h1 className="text-4xl font-light md:text-5xl">Cart</h1>
      </div>

      <CartPageContent />
    </main>
  );
}
