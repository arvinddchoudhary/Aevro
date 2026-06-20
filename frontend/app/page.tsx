import Link from 'next/link';
import { Hero } from '../components/home/Hero';
import { ProductCard } from '../components/products/ProductCard';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorState } from '../components/ui/ErrorState';
import { getCategories, getProducts } from '../lib/api/catalog';
import { ArrowRight, Camera } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const [categoriesResult, productsResult] = await Promise.allSettled([
    getCategories(),
    getProducts({ limit: 4, sort: 'newest' }),
  ]);

  const categories =
    categoriesResult.status === 'fulfilled' ? categoriesResult.value : [];
  const products =
    productsResult.status === 'fulfilled' ? productsResult.value.data : [];
  const hasCatalogError =
    categoriesResult.status === 'rejected' || productsResult.status === 'rejected';

  return (
    <main className="min-h-screen bg-white text-text">
      {/* ── Hero + Brand Strip ── */}
      <Hero />

      {/* ── Latest Products ── */}
      <section className="border-t border-border px-5 py-16 sm:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="mb-3 text-xs uppercase tracking-[0.2em] text-[#777777]">
                Latest products
              </p>
              <h2 className="text-3xl font-light">Built for repeat wear.</h2>
            </div>
            <Link href="/products" className="text-sm underline underline-offset-4">
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
            <div className="grid grid-cols-2 gap-px bg-border md:grid-cols-3">
              {products.map((product) => (
                <div key={product.id} className="bg-white">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Philosophy ── */}
      <section className="bg-dark px-6 py-20 lg:px-12 lg:py-28">
        <div className="mx-auto mb-16 grid max-w-[1200px] grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
          {/* LEFT */}
          <div>
            <p className="mb-5 text-[10px] uppercase tracking-[0.35em] text-[#555]">
              Our philosophy
            </p>
            <h2 className="mb-6 text-4xl font-light leading-[1.15] text-white lg:text-[52px]" style={{ fontFamily: 'var(--font-display)' }}>
              Clothes that <br />
              <span className="italic text-[#c8c0b0]">don't announce</span> <br />
              themselves.
            </h2>
            <p className="max-w-[400px] text-[13px] leading-[2.1] text-[#777]">
              We believe the best garment is one you forget you're wearing. No
              logos. No seasonal gimmicks. Just exceptional construction, honest
              materials, and a silhouette that ages with you.
            </p>
            <Link
              href="/products"
              className="mt-8 inline-flex items-center gap-2 border-b border-white/20 pb-1 text-[11px] uppercase tracking-[0.2em] text-white/60 transition-colors hover:border-white hover:text-white"
            >
              Explore the range <ArrowRight size={12} />
            </Link>
          </div>

          {/* RIGHT */}
          <div className="hidden flex-col justify-end lg:flex">
            <span className="select-none text-right text-[140px] font-light leading-none text-[#1a1a1a] lg:text-[180px]" style={{ fontFamily: 'var(--font-display)' }}>
              01
            </span>
            <span className="text-right text-[11px] uppercase tracking-[0.2em] text-[#444]">
              The collection
            </span>
          </div>
        </div>

        {/* Bottom part details */}
        <div className="mx-auto max-w-[1200px] border-t border-[#1f1f1f] pt-12">
          <div className="grid grid-cols-2 gap-px bg-[#1f1f1f] lg:grid-cols-4">
            {/* Block 1 */}
            <div className="bg-dark p-6 lg:p-8">
              <p className="mb-3 text-[10px] uppercase tracking-[0.25em] text-[#444]">
                01
              </p>
              <h3 className="mb-2 text-[15px] font-light text-white" style={{ fontFamily: 'var(--font-display)' }}>
                Considered fit
              </h3>
              <p className="text-[12px] leading-[1.8] text-[#555]">
                Cut for proportion, not trend. Built to move with you, not
                against you.
              </p>
            </div>
            {/* Block 2 */}
            <div className="bg-dark p-6 lg:p-8">
              <p className="mb-3 text-[10px] uppercase tracking-[0.25em] text-[#444]">
                02
              </p>
              <h3 className="mb-2 text-[15px] font-light text-white" style={{ fontFamily: 'var(--font-display)' }}>
                Honest fabric
              </h3>
              <p className="text-[12px] leading-[1.8] text-[#555]">
                Selected for hand feel, weight, and how it ages — not how it
                photographs.
              </p>
            </div>
            {/* Block 3 */}
            <div className="bg-dark p-6 lg:p-8">
              <p className="mb-3 text-[10px] uppercase tracking-[0.25em] text-[#444]">
                03
              </p>
              <h3 className="mb-2 text-[15px] font-light text-white" style={{ fontFamily: 'var(--font-display)' }}>
                No noise
              </h3>
              <p className="text-[12px] leading-[1.8] text-[#555]">
                No logos, no seasonal gimmicks. One range, done properly.
              </p>
            </div>
            {/* Block 4 */}
            <div className="bg-dark p-6 lg:p-8">
              <p className="mb-3 text-[10px] uppercase tracking-[0.25em] text-[#444]">
                04
              </p>
              <h3 className="mb-2 text-[15px] font-light text-white" style={{ fontFamily: 'var(--font-display)' }}>
                Direct to you
              </h3>
              <p className="text-[12px] leading-[1.8] text-[#555]">
                No retailer markup. Premium quality, fair price, sold only here.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Highlights ── */}
      <section className="bg-[#fafaf9] px-6 py-20 lg:px-12 lg:py-24">
        <div className="mx-auto max-w-[1200px]">
          <h2 className="mb-12 text-3xl font-light lg:text-4xl" style={{ fontFamily: 'var(--font-display)' }}>
            Why AEVRO
          </h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Item 1 */}
            <div className="border border-border bg-white p-7">
              <span className="mb-4 block text-4xl font-light text-[#e5e5e5] lg:text-5xl" style={{ fontFamily: 'var(--font-display)' }}>
                01
              </span>
              <h3 className="mb-3 text-[12px] uppercase tracking-[0.2em] text-text">
                Cut First
              </h3>
              <p className="text-[13px] leading-[1.8] text-secondary">
                Every decision is made for how it hangs on a moving body, not how
                it photographs flat.
              </p>
            </div>
            {/* Item 2 */}
            <div className="border border-border bg-white p-7">
              <span className="mb-4 block text-4xl font-light text-[#e5e5e5] lg:text-5xl" style={{ fontFamily: 'var(--font-display)' }}>
                02
              </span>
              <h3 className="mb-3 text-[12px] uppercase tracking-[0.2em] text-text">
                Small Batch
              </h3>
              <p className="text-[13px] leading-[1.8] text-secondary">
                We launch in limited runs so quality never gets diluted for
                volume.
              </p>
            </div>
            {/* Item 3 */}
            <div className="border border-border bg-white p-7">
              <span className="mb-4 block text-4xl font-light text-[#e5e5e5] lg:text-5xl" style={{ fontFamily: 'var(--font-display)' }}>
                03
              </span>
              <h3 className="mb-3 text-[12px] uppercase tracking-[0.2em] text-text">
                Direct Price
              </h3>
              <p className="text-[13px] leading-[1.8] text-secondary">
                No retailer markup. Premium quality at an honest price, sold only
                to you.
              </p>
            </div>
            {/* Item 4 */}
            <div className="border border-border bg-white p-7">
              <span className="mb-4 block text-4xl font-light text-[#e5e5e5] lg:text-5xl" style={{ fontFamily: 'var(--font-display)' }}>
                04
              </span>
              <h3 className="mb-3 text-[12px] uppercase tracking-[0.2em] text-text">
                Easy Returns
              </h3>
              <p className="text-[13px] leading-[1.8] text-secondary">
                If the fit isn't right, we'll sort it. No complicated process, no
                fuss.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Worn & Styled ── */}
      <section className="mx-auto max-w-[1200px] px-6 py-20 lg:px-12 lg:py-24">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-3xl font-light lg:text-4xl" style={{ fontFamily: 'var(--font-display)' }}>
            Worn & styled
          </h2>
          <a
            href="#"
            className="flex items-center gap-2 text-[11px] uppercase tracking-[0.15em] text-secondary transition-colors hover:text-text"
          >
            <Camera size={14} />
            @aevro.studio
          </a>
        </div>

        <div className="grid grid-cols-2 gap-px bg-border sm:grid-cols-3 md:grid-cols-5">
          {/* Tile 1 */}
          <div className="flex aspect-square cursor-pointer items-center justify-center bg-[#f5f3ef] transition-colors duration-200 hover:bg-[#ede9e3]">
            <span className="text-[9px] uppercase tracking-[0.25em] text-[#ccc]">
              Photo
            </span>
          </div>
          {/* Tile 2 */}
          <div className="flex aspect-square cursor-pointer items-center justify-center bg-[#efebe3] transition-colors duration-200 hover:bg-[#ede9e3]">
            <span className="text-[9px] uppercase tracking-[0.25em] text-[#ccc]">
              Photo
            </span>
          </div>
          {/* Tile 3 */}
          <div className="flex aspect-square cursor-pointer items-center justify-center bg-[#f5f3ef] transition-colors duration-200 hover:bg-[#ede9e3]">
            <span className="text-[9px] uppercase tracking-[0.25em] text-[#ccc]">
              Photo
            </span>
          </div>
          {/* Tile 4 */}
          <div className="hidden aspect-square cursor-pointer items-center justify-center bg-[#efebe3] transition-colors duration-200 hover:bg-[#ede9e3] sm:flex">
            <span className="text-[9px] uppercase tracking-[0.25em] text-[#ccc]">
              Photo
            </span>
          </div>
          {/* Tile 5 */}
          <div className="hidden aspect-square cursor-pointer items-center justify-center bg-[#f5f3ef] transition-colors duration-200 hover:bg-[#ede9e3] md:flex">
            <span className="text-[9px] uppercase tracking-[0.25em] text-[#ccc]">
              Photo
            </span>
          </div>
        </div>
      </section>
    </main>
  );
}
