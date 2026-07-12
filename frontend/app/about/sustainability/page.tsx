import type { Metadata } from 'next';
import Link from 'next/link';
import { pageMetadata } from '../../../lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Sustainability',
  description:
    'AEVRO\'s approach to responsible fashion — fewer pieces, lasting quality, thoughtful production, and a commitment to continuous improvement.',
  path: '/about/sustainability',
});

export default function SustainabilityPage() {
  return (
    <main className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1500px] overflow-hidden rounded-[12px] border border-[#ddd4c8] bg-[#fbf7f0] shadow-[0_22px_70px_rgba(17,17,17,0.08)]">
        <section className="flex min-h-[420px] items-center border-b border-[#ddd4c8] bg-[#fffaf3]/70 px-6 py-16 sm:px-12 lg:px-20">
          <div className="max-w-[620px]">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#4d473f]">
              About
            </p>
            <h1 className="mt-6 font-serif text-[2.55rem] font-light uppercase leading-[0.98] tracking-normal text-[#111111] sm:text-[3.7rem]">
              Sustainability
            </h1>
            <div className="mt-8 max-w-[520px] space-y-4 text-sm leading-7 text-[#3f3932]">
              <p>
                We believe the most sustainable garment is one you actually keep.
                AEVRO is built around this idea: design fewer pieces, make them
                well, and create clothing that people wear for years — not weeks.
              </p>
              <p>
                We avoid large seasonal collections and trend-driven production.
                Instead, we focus on timeless silhouettes made from durable,
                carefully sourced fabrics. Every material choice is weighed against
                longevity, comfort, and environmental impact.
              </p>
              <p>
                We are honest about where we are. Sustainability is a journey, not a
                badge. As we grow, we are actively working to improve our sourcing,
                reduce packaging waste, and partner with manufacturers who share our
                values.
              </p>
              <p>
                Better choices, taken consistently, lead to greater impact. That is
                the standard we hold ourselves to.
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
