import Link from 'next/link';
import { ProductCard } from '../components/products/ProductCard';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorState } from '../components/ui/ErrorState';
import { getProducts } from '../lib/api/catalog';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const productsResult = await Promise.allSettled([
    getProducts({ limit: 4, sort: 'newest' }),
  ]);
  const products =
    productsResult[0].status === 'fulfilled' ? productsResult[0].value.data : [];
  const hasCatalogError = productsResult[0].status === 'rejected';

  return (
    <main className="text-[#111111]">
      <section className="border-b border-[#ddd4c8]">
        <div className="relative min-h-[620px] overflow-hidden md:min-h-[680px] lg:aspect-[2880/1100] lg:min-h-0">
          <img
            src="/images/brand/hero-trousers.webp"
            alt="AEVRO tailored ivory trousers"
            className="absolute inset-0 h-full w-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(251,247,240,0.82)_0%,rgba(251,247,240,0.72)_28%,rgba(251,247,240,0.2)_52%,rgba(251,247,240,0)_76%)]" />
          <div className="relative flex min-h-[620px] items-center px-6 py-14 sm:px-12 md:min-h-[680px] lg:min-h-full lg:px-20 xl:px-28">
            <div className="max-w-2xl">
              <p className="text-xs font-medium uppercase tracking-[0.14em]">
                Timeless form. Modern presence.
              </p>
              <h1 className="mt-7 text-6xl font-light uppercase leading-[0.98] tracking-[-0.02em] md:text-7xl xl:text-8xl">
                Tailored to define.
              </h1>
              <p className="mt-7 max-w-md text-sm leading-7 text-[#514c45]">
                Refined trousers and elevated essentials crafted for the way you
                live and dress.
              </p>
              <Link
                href="/products"
                className="mt-8 inline-flex min-h-[3.25rem] min-w-44 items-center justify-center border border-[#111111]/15 bg-[#fffaf3]/90 px-8 py-4 text-sm font-medium uppercase tracking-[0.08em] text-[#111111] shadow-[0_8px_24px_rgba(17,17,17,0.05)] backdrop-blur-sm transition duration-300 hover:border-[#111111]/35 hover:bg-[#f3eadc]"
              >
                Shop trousers
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="aevro-container py-14">
        <div className="mb-6 flex items-center justify-between">
          <p className="text-xs font-medium uppercase tracking-[0.08em]">
            Best sellers
          </p>
          <Link href="/products" className="text-xs font-medium uppercase tracking-[0.08em] underline-offset-8 hover:underline">
            View all
          </Link>
        </div>
        {hasCatalogError && (
          <ErrorState
            title="Catalog unavailable"
            message="The product API could not be reached. Check the backend URL and try again."
          />
        )}
        {!hasCatalogError && products.length === 0 && (
          <EmptyState
            title="No products yet"
            message="Once active products are added, they will appear here."
          />
        )}
        {products.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} compact />
            ))}
          </div>
        )}
      </section>

      <section className="relative min-h-[430px] overflow-hidden border-y border-[#ddd4c8]">
        <img
          src="/images/brand/fabric-band.webp"
          alt="Close-up of premium AEVRO fabric"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="relative flex min-h-[430px] items-center justify-end px-6 py-16 sm:px-12 lg:px-20 xl:px-28">
          <div className="max-w-xl">
            <p className="text-xs font-medium uppercase tracking-[0.1em]">
              Fabric first
            </p>
            <h2 className="mt-4 text-4xl font-light uppercase leading-tight md:text-5xl">
              Quality you can feel.
            </h2>
            <p className="mt-5 text-sm leading-7 text-[#514c45]">
              We use premium natural fabrics chosen for comfort, drape, and
              durability. Thoughtful construction gives each piece its quiet
              confidence.
            </p>
            <div className="mt-10 grid gap-6 text-xs uppercase tracking-[0.08em] sm:grid-cols-3">
              <span>Premium fabrics</span>
              <span>Timeless durability</span>
              <span>Responsible made</span>
            </div>
          </div>
        </div>
      </section>

      <section className="relative min-h-[520px] overflow-hidden border-b border-[#ddd4c8]">
        <img
          src="/images/brand/atelier-band.webp"
          alt="AEVRO studio rack with neutral garments"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="relative flex min-h-[520px] items-center px-6 py-20 sm:px-12 lg:px-20 xl:px-28">
        <div className="max-w-xl">
          <p className="text-xs font-medium uppercase tracking-[0.1em]">
            Our philosophy
          </p>
          <h2 className="mt-4 max-w-xl text-4xl font-light uppercase leading-tight md:text-5xl">
            Simplicity. Intention. Lasting style.
          </h2>
          <p className="mt-5 max-w-sm text-sm leading-7 text-[#514c45]">
            At AEVRO, true style is found in quality, fit, and the details that
            stand the test of time.
          </p>
          <Link
            href="/about"
            className="mt-8 inline-flex text-xs font-medium uppercase tracking-[0.08em] underline-offset-8 hover:underline"
          >
            About AEVRO →
          </Link>
        </div>
        </div>
      </section>
    </main>
  );
}
