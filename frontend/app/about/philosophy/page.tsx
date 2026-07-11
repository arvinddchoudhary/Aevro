import type { Metadata } from 'next';
import Link from 'next/link';
import { pageMetadata } from '../../../lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Philosophy',
  description:
    'The design philosophy behind AEVRO — timeless over trendy, quality over quantity, and purpose in every detail.',
  path: '/about/philosophy',
});

export default function PhilosophyPage() {
  return (
    <main className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1500px] overflow-hidden rounded-[12px] border border-[#ddd4c8] bg-[#fbf7f0] shadow-[0_22px_70px_rgba(17,17,17,0.08)]">
        <section className="flex min-h-[420px] items-center border-b border-[#ddd4c8] bg-[#fffaf3]/70 px-6 py-16 sm:px-12 lg:px-20">
          <div className="max-w-[620px]">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#4d473f]">
              About
            </p>
            <h1 className="mt-6 font-serif text-[2.55rem] font-light uppercase leading-[0.98] tracking-normal text-[#111111] sm:text-[3.7rem]">
              Philosophy
            </h1>
            <div className="mt-8 max-w-[520px] space-y-4 text-sm leading-7 text-[#3f3932]">
              <p>
                AEVRO is guided by a single belief: clothing should be designed with
                the same care as the life it is worn in. Every silhouette, every
                fabric, every stitch exists because it earns its place — not because
                it fills a collection.
              </p>
              <p>
                We reject the idea that more is better. Instead, we focus on fewer
                pieces, each refined until they feel inevitable. Proportions are
                tested and retested. Materials are sourced for how they wear over
                months, not how they look on a screen.
              </p>
              <p>
                Timeless over trendy. Restraint over excess. The result is a
                wardrobe that feels calm, intentional, and built to last — because
                good design never goes out of style.
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
