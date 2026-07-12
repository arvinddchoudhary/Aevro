import type { Metadata } from 'next';
import Link from 'next/link';
import { pageMetadata } from '../../../lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Terms & Conditions',
  description:
    'AEVRO terms and conditions — rules governing the use of our website, purchases, and services.',
  path: '/legal/terms',
});

export default function TermsPage() {
  return (
    <main className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1500px] overflow-hidden rounded-[12px] border border-[#ddd4c8] bg-[#fbf7f0] shadow-[0_22px_70px_rgba(17,17,17,0.08)]">
        <section className="border-b border-[#ddd4c8] bg-[#fffaf3]/70 px-6 py-16 sm:px-12 lg:px-20">
          <div className="max-w-[620px]">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#4d473f]">
              Legal
            </p>
            <h1 className="mt-6 font-serif text-[2.55rem] font-light uppercase leading-[0.98] tracking-normal text-[#111111] sm:text-[3.7rem]">
              Terms &amp; Conditions
            </h1>
          </div>
        </section>

        <section className="border-b border-[#ddd4c8] px-6 py-12 sm:px-12 lg:px-20">
          <div className="max-w-[700px] space-y-8">
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-[#111111]">
                General
              </h2>
              <div className="mt-4 space-y-3 text-sm leading-7 text-[#3f3932]">
                <p>
                  By accessing and using aevro.com, you agree to be bound by these
                  terms and conditions. If you do not agree with any part of these
                  terms, please do not use our website.
                </p>
              </div>
            </div>

            <div>
              <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-[#111111]">
                Products &amp; Pricing
              </h2>
              <div className="mt-4 space-y-3 text-sm leading-7 text-[#3f3932]">
                <p>
                  All product descriptions, images, and prices are provided in good
                  faith. We reserve the right to update pricing, modify product
                  descriptions, or discontinue products at any time without prior
                  notice.
                </p>
                <p>
                  Prices are listed in Indian Rupees (₹) and are inclusive of
                  applicable taxes unless stated otherwise.
                </p>
              </div>
            </div>

            <div>
              <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-[#111111]">
                Orders &amp; Payment
              </h2>
              <div className="mt-4 space-y-3 text-sm leading-7 text-[#3f3932]">
                <p>
                  An order is confirmed only after successful payment. We reserve
                  the right to cancel or refuse any order at our discretion,
                  including orders suspected of fraud.
                </p>
                <p>
                  All payments are processed through secure, PCI-compliant payment
                  gateways. AEVRO does not store your payment card details.
                </p>
              </div>
            </div>

            <div>
              <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-[#111111]">
                Intellectual Property
              </h2>
              <div className="mt-4 space-y-3 text-sm leading-7 text-[#3f3932]">
                <p>
                  All content on aevro.com — including images, text, logos, and
                  design — is the property of AEVRO and is protected by applicable
                  intellectual property laws. Unauthorised use is prohibited.
                </p>
              </div>
            </div>

            <div>
              <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-[#111111]">
                Limitation of Liability
              </h2>
              <div className="mt-4 space-y-3 text-sm leading-7 text-[#3f3932]">
                <p>
                  AEVRO shall not be liable for any indirect, incidental, or
                  consequential damages arising from the use of our website or
                  products. Our liability is limited to the purchase price of the
                  product in question.
                </p>
              </div>
            </div>

            <div>
              <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-[#111111]">
                Governing Law
              </h2>
              <div className="mt-4 space-y-3 text-sm leading-7 text-[#3f3932]">
                <p>
                  These terms are governed by the laws of India. Any disputes shall
                  be subject to the exclusive jurisdiction of the courts in the
                  applicable Indian jurisdiction.
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
            Questions? Contact us
            <span aria-hidden="true">→</span>
          </Link>
        </section>
      </div>
    </main>
  );
}
