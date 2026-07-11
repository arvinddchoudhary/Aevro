import type { Metadata } from 'next';
import Link from 'next/link';
import { pageMetadata } from '../../../lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Core Collection',
  description:
    'Explore the AEVRO Core Collection — everyday essentials designed with clean lines, premium fabrics, and effortless versatility.',
  path: '/collections/core-collection',
});

export default function CoreCollectionPage() {
  return (
    <main className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1500px] overflow-hidden rounded-[12px] border border-[#ddd4c8] bg-[#fbf7f0] shadow-[0_22px_70px_rgba(17,17,17,0.08)]">
        <section className="flex min-h-[420px] items-center border-b border-[#ddd4c8] bg-[#fffaf3]/70 px-6 py-16 sm:px-12 lg:px-20">
          <div className="max-w-[620px]">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#4d473f]">
              Collections
            </p>
            <h1 className="mt-6 font-serif text-[2.55rem] font-light uppercase leading-[0.98] tracking-normal text-[#111111] sm:text-[3.7rem]">
              Core Collection
            </h1>
            <div className="mt-8 max-w-[520px] space-y-4 text-sm leading-7 text-[#3f3932]">
              <p>
                The Core Collection is AEVRO stripped to its essence — clean,
                versatile pieces designed for every day. These are the trousers you
                reach for without thinking, because they work everywhere.
              </p>
              <p>
                Built with the same construction standards as our signature line but
                in a pared-back range of colourways and fits, the Core Collection
                focuses on reliability. Neutral tones, thoughtful proportions, and
                fabrics that soften with wear.
              </p>
              <p>
                No trends. No noise. Just clothing that works.
              </p>
            </div>
          </div>
        </section>

        <section className="flex min-h-[260px] items-center bg-[#fbf7f0] px-6 py-14 sm:px-12 lg:px-20">
          <div className="max-w-[520px]">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#514c45]">
              Everyday essentials
            </p>
            <h2 className="mt-6 font-serif text-4xl font-light uppercase leading-[1.04] tracking-normal text-[#111111] sm:text-5xl">
              Simple. Refined. Reliable.
            </h2>
            <p className="mt-7 text-sm leading-7 text-[#514c45]">
              Each piece in the Core Collection is designed to be worn season after
              season. Premium construction, considered details, and fabrics chosen
              for comfort and durability — clothing that earns its place in your
              wardrobe.
            </p>
            <Link
              href="/products"
              className="mt-8 inline-flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.1em] underline-offset-8 hover:underline"
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
