import type { Metadata } from 'next';
import Link from 'next/link';
import { pageMetadata } from '../../../lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Shipping Policy',
  description:
    'AEVRO shipping policy — delivery regions, timelines, charges, and dispatch details.',
  path: '/legal/shipping-policy',
});

export default function ShippingPolicyPage() {
  return (
    <main className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1500px] overflow-hidden rounded-[12px] border border-[#ddd4c8] bg-[#fbf7f0] shadow-[0_22px_70px_rgba(17,17,17,0.08)]">
        <section className="border-b border-[#ddd4c8] bg-[#fffaf3]/70 px-6 py-16 sm:px-12 lg:px-20">
          <div className="max-w-[620px]">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#4d473f]">
              Legal
            </p>
            <h1 className="mt-6 font-serif text-[2.55rem] font-light uppercase leading-[0.98] tracking-normal text-[#111111] sm:text-[3.7rem]">
              Shipping Policy
            </h1>
          </div>
        </section>

        <section className="border-b border-[#ddd4c8] px-6 py-12 sm:px-12 lg:px-20">
          <div className="max-w-[700px] space-y-8">
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-[#111111]">
                Delivery Regions
              </h2>
              <div className="mt-4 space-y-3 text-sm leading-7 text-[#3f3932]">
                <p>
                  AEVRO currently ships to all serviceable pin codes within India.
                  International shipping is not available at this time.
                </p>
              </div>
            </div>

            <div>
              <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-[#111111]">
                Delivery Timelines
              </h2>
              <div className="mt-4 space-y-3 text-sm leading-7 text-[#3f3932]">
                <p>
                  Metro cities: 3–5 business days. Other locations: 5–7 business
                  days. Delivery timelines are estimates and may vary due to
                  unforeseen circumstances.
                </p>
              </div>
            </div>

            <div>
              <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-[#111111]">
                Shipping Charges
              </h2>
              <div className="mt-4 space-y-3 text-sm leading-7 text-[#3f3932]">
                <p>
                  Orders above ₹4,999 qualify for free standard shipping. A flat
                  shipping fee of ₹149 applies to orders below this amount.
                </p>
              </div>
            </div>

            <div>
              <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-[#111111]">
                Dispatch
              </h2>
              <div className="mt-4 space-y-3 text-sm leading-7 text-[#3f3932]">
                <p>
                  Orders placed before 2 PM IST on business days are typically
                  dispatched the same day. Orders placed after this time or on
                  weekends and holidays are dispatched the next business day.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="px-6 py-12 sm:px-12 lg:px-20">
          <Link
            href="/help/contact"
            className="inline-flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.1em] underline-offset-8 hover:underline"
          >
            Questions about shipping? Contact us
            <span aria-hidden="true">→</span>
          </Link>
        </section>
      </div>
    </main>
  );
}
