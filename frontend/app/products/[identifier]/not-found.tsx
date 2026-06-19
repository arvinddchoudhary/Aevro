import Link from 'next/link';

export default function ProductNotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center px-5 py-16">
      <div className="max-w-md text-center">
        <p className="mb-4 text-xs uppercase tracking-[0.22em] text-[#777777]">
          Product not found
        </p>
        <h1 className="text-4xl font-light">This product is not available.</h1>
        <Link href="/products" className="mt-8 inline-block underline underline-offset-4">
          Back to products
        </Link>
      </div>
    </main>
  );
}
