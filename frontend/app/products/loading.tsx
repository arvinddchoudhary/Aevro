import { ProductGridSkeleton } from '../../components/products/ProductGridSkeleton';

export default function ProductsLoading() {
  return (
    <main className="mx-auto min-h-screen max-w-6xl px-5 py-12 sm:px-8">
      <div className="mb-10 h-24 max-w-md animate-pulse bg-[#f3f3f3]" />
      <ProductGridSkeleton />
    </main>
  );
}
