import type { Metadata } from 'next';
import Link from 'next/link';
import { pageMetadata } from '../../../lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Signature Pleats Collection',
  description:
    'Explore the AEVRO Signature Pleats collection — refined pleated trousers designed with precision, structure, and timeless elegance.',
  path: '/collections/signature-pleats',
});

export default function SignaturePleatsPage() {
  return (
    <main className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1500px] overflow-hidden rounded-[12px] border border-[#ddd4c8] bg-[#fbf7f0] shadow-[0_22px_70px_rgba(17,17,17,0.08)]">
        <section className="flex min-h-[420px] items-center border-b border-[#ddd4c8] bg-[#fffaf3]/70 px-6 py-16 sm:px-12 lg:px-20">
          <div className="max-w-[620px]">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#4d473f]">
              Collections
            </p>
            <h1 className="mt-6 font-serif text-[2.55rem] font-light uppercase leading-[0.98] tracking-normal text-[#111111] sm:text-[3.7rem]">
              Signature Pleats
            </h1>
            <div className="mt-8 max-w-[520px] space-y-4 text-sm leading-7 text-[#3f3932]">
              <p>
                The Signature Pleats collection is the foundation of AEVRO — where
                structure meets fluidity. Each pair is designed with deep, precisely
                pressed pleats that drape naturally for a clean, sculpted silhouette.
              </p>
              <p>
                Crafted from premium fabrics with considered weight and hand-feel,
                these trousers move between formal and relaxed settings with ease.
                The fit is intentional: a tailored waist, a gentle taper, and a
                balanced break at the ankle.
              </p>
              <p>
                This is the silhouette AEVRO was built around — refined, versatile,
                and designed to age beautifully.
              </p>
            </div>
          </div>
        </section>

        <section className="flex min-h-[260px] items-center bg-[#fbf7f0] px-6 py-14 sm:px-12 lg:px-20">
          <div className="max-w-[520px]">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#514c45]">
              Details
            </p>
            <h2 className="mt-6 font-serif text-4xl font-light uppercase leading-[1.04] tracking-normal text-[#111111] sm:text-5xl">
              Built to last. Made to move.
            </h2>
            <p className="mt-7 text-sm leading-7 text-[#514c45]">
              Every garment in this collection is constructed with reinforced
              stitching, premium hardware, and clean internal finishing. The result
              is a trouser that holds its shape wash after wash, wear after wear.
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
