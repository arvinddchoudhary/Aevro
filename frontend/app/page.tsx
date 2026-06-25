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
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} compact />
            ))}
          </div>
        )}
      </section>

      <section className="grid overflow-hidden border-y border-[#ddd4c8] bg-[#fffaf3] lg:grid-cols-[40%_60%]">
        <div className="h-[360px] bg-[#111] sm:h-[420px] lg:h-[520px]">
          <img
            src="/images/brand/fabric-band.webp"
            alt="Close-up of premium AEVRO fabric"
            className="h-full w-full object-cover object-top"
          />
        </div>
        <div className="flex min-h-[360px] items-center px-6 py-12 sm:min-h-[420px] sm:px-12 lg:min-h-[520px] lg:px-20 xl:px-24">
          <div className="w-full max-w-3xl">
            <p className="text-xs font-medium uppercase tracking-[0.1em]">
              Fabric first
            </p>
            <h2 className="mt-5 max-w-xl font-serif text-4xl font-light uppercase leading-[1.08] tracking-[-0.02em] md:text-5xl">
              The difference is in the details.
            </h2>
            <p className="mt-5 max-w-xl text-base leading-7 text-[#514c45]">
              Every pair is crafted from carefully selected natural fabrics,
              chosen for their feel, fall, and lasting quality.
            </p>
            <div className="mt-12 grid gap-8 sm:grid-cols-3">
              <div className="border-[#ddd4c8] sm:border-r sm:pr-8">
                <span className="block text-4xl font-light leading-none text-[#6d665d]">
                  #
                </span>
                <h3 className="mt-7 text-xs font-semibold uppercase tracking-[0.08em]">
                  Premium fabrics
                </h3>
                <p className="mt-3 text-sm leading-6 text-[#514c45]">
                  Natural, breathable, and chosen for lasting comfort.
                </p>
              </div>
              <div className="border-[#ddd4c8] sm:border-r sm:px-8">
                <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[#6d665d] text-xl font-light text-[#6d665d]">
                  ⌚
                </span>
                <h3 className="mt-7 text-xs font-semibold uppercase tracking-[0.08em]">
                  Timeless durability
                </h3>
                <p className="mt-3 text-sm leading-6 text-[#514c45]">
                  Thoughtfully constructed to stand the test of time.
                </p>
              </div>
              <div className="sm:pl-8">
                <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[#6d665d] text-xl font-light text-[#6d665d]">
                  ♧
                </span>
                <h3 className="mt-7 text-xs font-semibold uppercase tracking-[0.08em]">
                  Responsible made
                </h3>
                <p className="mt-3 text-sm leading-6 text-[#514c45]">
                  Ethically sourced materials with a lighter footprint.
                </p>
              </div>
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
