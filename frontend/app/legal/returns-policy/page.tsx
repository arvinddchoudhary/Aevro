import type { Metadata } from 'next';
import Link from 'next/link';
import { pageMetadata } from '../../../lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Returns Policy',
  description:
    'AEVRO returns policy — return eligibility, timeframes, refund process, and conditions.',
  path: '/legal/returns-policy',
});

export default function ReturnsPolicyPage() {
  return (
    <main className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1500px] overflow-hidden rounded-[12px] border border-[#ddd4c8] bg-[#fbf7f0] shadow-[0_22px_70px_rgba(17,17,17,0.08)]">
        <section className="border-b border-[#ddd4c8] bg-[#fffaf3]/70 px-6 py-16 sm:px-12 lg:px-20">
          <div className="max-w-[620px]">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#4d473f]">
              Legal
            </p>
            <h1 className="mt-6 font-serif text-[2.55rem] font-light uppercase leading-[0.98] tracking-normal text-[#111111] sm:text-[3.7rem]">
              Returns Policy
            </h1>
          </div>
        </section>

        <section className="border-b border-[#ddd4c8] px-6 py-12 sm:px-12 lg:px-20">
          <div className="max-w-[700px] space-y-8">
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-[#111111]">
                Eligibility
              </h2>
              <div className="mt-4 space-y-3 text-sm leading-7 text-[#3f3932]">
                <p>
                  Items may be returned within 14 days of delivery provided they are
                  unworn, unwashed, and in their original condition with all tags
                  attached.
                </p>
                <p>
                  Items that have been altered, damaged by the customer, or returned
                  without original packaging are not eligible for a return or
                  refund.
                </p>
              </div>
            </div>

            <div>
              <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-[#111111]">
                Return Process
              </h2>
              <div className="mt-4 space-y-3 text-sm leading-7 text-[#3f3932]">
                <p>
                  To initiate a return, contact us at{' '}
                  <a
                    href="mailto:support@aevro.com"
                    className="underline underline-offset-4"
                  >
                    support@aevro.com
                  </a>{' '}
                  with your order number and reason for return. A return shipping
                  label will be provided within 24 hours.
                </p>
              </div>
            </div>

            <div>
              <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-[#111111]">
                Refunds
              </h2>
              <div className="mt-4 space-y-3 text-sm leading-7 text-[#3f3932]">
                <p>
                  Once the returned item is received and inspected, refunds are
                  processed within 5–7 business days. The refund is credited to your
                  original payment method.
                </p>
                <p>
                  Shipping charges are non-refundable unless the return is due to a
                  defective or incorrect item.
                </p>
              </div>
            </div>

            <div>
              <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-[#111111]">
                Exchanges
              </h2>
              <div className="mt-4 space-y-3 text-sm leading-7 text-[#3f3932]">
                <p>
                  Exchanges for a different size are available subject to stock. The
                  same 14-day return window applies.
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
            Need help with a return? Contact us
            <span aria-hidden="true">→</span>
          </Link>
        </section>
      </div>
    </main>
  );
}
