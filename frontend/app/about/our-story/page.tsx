import type { Metadata } from 'next';
import Link from 'next/link';
import { pageMetadata } from '../../../lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Our Story',
  description:
    'How AEVRO began — a modern essentials brand built on simplicity, purpose, and the belief that everyday clothing deserves thoughtful design.',
  path: '/about/our-story',
});

export default function OurStoryPage() {
  return (
    <main className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1500px] overflow-hidden rounded-[12px] border border-[#ddd4c8] bg-[#fbf7f0] shadow-[0_22px_70px_rgba(17,17,17,0.08)]">
        <section className="flex min-h-[420px] items-center border-b border-[#ddd4c8] bg-[#fffaf3]/70 px-6 py-16 sm:px-12 lg:px-20">
          <div className="max-w-[620px]">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#4d473f]">
              About
            </p>
            <h1 className="mt-6 font-serif text-[2.55rem] font-light uppercase leading-[0.98] tracking-normal text-[#111111] sm:text-[3.7rem]">
              Our Story
            </h1>
            <div className="mt-8 max-w-[520px] space-y-4 text-sm leading-7 text-[#3f3932]">
              <p>
                AEVRO started with a question: why does everyday clothing so rarely
                feel considered? Too many wardrobes are filled with pieces that look
                fine but feel forgettable — made quickly, priced cheaply, and
                discarded just as fast.
              </p>
              <p>
                We wanted to build something different. A brand focused on one thing
                done exceptionally well: the trouser. Not a trend piece. Not a
                seasonal drop. A thoughtfully designed garment built for the way
                people actually live and dress.
              </p>
              <p>
                AEVRO began with one silhouette — the pleated trouser — and the
                commitment to refine it until every detail was right. The fabric,
                the fit, the construction, the finish. Everything intentional.
              </p>
              <p>
                From there, we are growing carefully. Each new piece follows the
                same principle: design with purpose, build with quality, and make
                something worth keeping.
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
