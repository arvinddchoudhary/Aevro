import type { Metadata } from 'next';
import Link from 'next/link';
import { pageMetadata } from '../../../lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Craftsmanship',
  description:
    'How AEVRO garments are made — expert tailoring, premium fabrics, precise construction, and attention to every finishing detail.',
  path: '/about/craftsmanship',
});

export default function CraftsmanshipPage() {
  return (
    <main className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1500px] overflow-hidden rounded-[12px] border border-[#ddd4c8] bg-[#fbf7f0] shadow-[0_22px_70px_rgba(17,17,17,0.08)]">
        <section className="flex min-h-[420px] items-center border-b border-[#ddd4c8] bg-[#fffaf3]/70 px-6 py-16 sm:px-12 lg:px-20">
          <div className="max-w-[620px]">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#4d473f]">
              About
            </p>
            <h1 className="mt-6 font-serif text-[2.55rem] font-light uppercase leading-[0.98] tracking-normal text-[#111111] sm:text-[3.7rem]">
              Craftsmanship
            </h1>
            <div className="mt-8 max-w-[520px] space-y-4 text-sm leading-7 text-[#3f3932]">
              <p>
                Every AEVRO garment begins on the pattern table. Silhouettes are
                drafted, tested in muslin, adjusted, and tested again before a
                single production cut is made. This process takes time — and that is
                the point.
              </p>
              <p>
                Our fabrics are selected for longevity: weight, drape, recovery, and
                how they age with wear. We work with mills that share our standards
                for consistency and finish, sourcing materials that feel as good on
                the hundredth wear as the first.
              </p>
              <p>
                Construction details matter. Reinforced stress points, clean
                internal finishing, properly weighted hardware, and precise pressing
                ensure every trouser holds its shape and structure over time.
              </p>
              <p>
                We do not rush this process. Craftsmanship, at AEVRO, is not a
                marketing word — it is how we work.
              </p>
            </div>
          </div>
        </section>

        <section className="flex items-center bg-[#fbf7f0] px-6 py-14 sm:px-12 lg:px-20">
          <div className="max-w-[520px]">
            <Link
              href="/products"
              className="inline-flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.1em] underline-offset-8 hover:underline"
            >
              Shop the collection
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
