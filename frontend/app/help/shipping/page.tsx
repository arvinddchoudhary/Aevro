import type { Metadata } from 'next';
import Link from 'next/link';
import { pageMetadata } from '../../../lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Orders & Shipping',
  description:
    'AEVRO shipping information — delivery timelines, order tracking, shipping charges, and everything you need to know about getting your order.',
  path: '/help/shipping',
});

export default function ShippingPage() {
  return (
    <main className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1500px] overflow-hidden rounded-[12px] border border-[#ddd4c8] bg-[#fbf7f0] shadow-[0_22px_70px_rgba(17,17,17,0.08)]">
        <section className="border-b border-[#ddd4c8] bg-[#fffaf3]/70 px-6 py-16 sm:px-12 lg:px-20">
          <div className="max-w-[620px]">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#4d473f]">
              Help
            </p>
            <h1 className="mt-6 font-serif text-[2.55rem] font-light uppercase leading-[0.98] tracking-normal text-[#111111] sm:text-[3.7rem]">
              Orders &amp; Shipping
            </h1>
          </div>
        </section>

        <section className="border-b border-[#ddd4c8] px-6 py-12 sm:px-12 lg:px-20">
          <div className="max-w-[620px] space-y-8">
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-[#111111]">
                Delivery Timelines
              </h2>
              <div className="mt-4 space-y-3 text-sm leading-7 text-[#3f3932]">
                <p>
                  <strong className="text-[#111111]">Metro cities:</strong> 3–5
                  business days
                </p>
                <p>
                  <strong className="text-[#111111]">Rest of India:</strong> 5–7
                  business days
                </p>
                <p>
                  Orders placed before 2 PM IST on business days are typically
                  dispatched the same day.
                </p>
              </div>
            </div>

            <div>
              <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-[#111111]">
                Shipping Charges
              </h2>
              <div className="mt-4 space-y-3 text-sm leading-7 text-[#3f3932]">
                <p>
                  Free shipping on all orders above ₹4,999. A flat shipping fee of
                  ₹149 applies to orders below this threshold.
                </p>
              </div>
            </div>

            <div>
              <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-[#111111]">
                Order Tracking
              </h2>
              <div className="mt-4 space-y-3 text-sm leading-7 text-[#3f3932]">
                <p>
                  Once your order ships, you will receive a confirmation email with
                  a tracking link. You can also check order status from your{' '}
                  <Link href="/account" className="underline underline-offset-4">
                    account page
                  </Link>
                  .
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
            Have a question about your order? Contact us
            <span aria-hidden="true">→</span>
          </Link>
        </section>
      </div>
    </main>
  );
}
