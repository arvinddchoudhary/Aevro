import type { Metadata } from 'next';
import Link from 'next/link';
import { pageMetadata } from '../../../lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Privacy Policy',
  description:
    'AEVRO privacy policy — how we collect, use, store, and protect your personal information.',
  path: '/legal/privacy',
});

export default function PrivacyPolicyPage() {
  return (
    <main className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1500px] overflow-hidden rounded-[12px] border border-[#ddd4c8] bg-[#fbf7f0] shadow-[0_22px_70px_rgba(17,17,17,0.08)]">
        <section className="border-b border-[#ddd4c8] bg-[#fffaf3]/70 px-6 py-16 sm:px-12 lg:px-20">
          <div className="max-w-[620px]">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#4d473f]">
              Legal
            </p>
            <h1 className="mt-6 font-serif text-[2.55rem] font-light uppercase leading-[0.98] tracking-normal text-[#111111] sm:text-[3.7rem]">
              Privacy Policy
            </h1>
          </div>
        </section>

        <section className="border-b border-[#ddd4c8] px-6 py-12 sm:px-12 lg:px-20">
          <div className="max-w-[700px] space-y-8">
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-[#111111]">
                Information We Collect
              </h2>
              <div className="mt-4 space-y-3 text-sm leading-7 text-[#3f3932]">
                <p>
                  When you visit aevro.com, create an account, or place an order, we
                  collect personal information necessary to fulfil your purchase and
                  improve your experience. This includes your name, email address,
                  shipping address, phone number, and payment details.
                </p>
                <p>
                  We also collect non-personal data such as browser type, device
                  information, and browsing behaviour through cookies and similar
                  technologies.
                </p>
              </div>
            </div>

            <div>
              <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-[#111111]">
                How We Use Your Information
              </h2>
              <div className="mt-4 space-y-3 text-sm leading-7 text-[#3f3932]">
                <p>
                  We use your information to process orders, manage your account,
                  communicate order updates, and provide customer support. With your
                  consent, we may also send you marketing communications about new
                  collections and promotions.
                </p>
              </div>
            </div>

            <div>
              <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-[#111111]">
                Data Security
              </h2>
              <div className="mt-4 space-y-3 text-sm leading-7 text-[#3f3932]">
                <p>
                  We implement industry-standard security measures to protect your
                  personal data. Payment information is processed through secure,
                  PCI-compliant payment gateways and is never stored on our servers.
                </p>
              </div>
            </div>

            <div>
              <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-[#111111]">
                Your Rights
              </h2>
              <div className="mt-4 space-y-3 text-sm leading-7 text-[#3f3932]">
                <p>
                  You have the right to access, correct, or delete your personal
                  data at any time. You may also opt out of marketing communications
                  by contacting us or using the unsubscribe link in our emails.
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
            Questions about your data? Contact us
            <span aria-hidden="true">→</span>
          </Link>
        </section>
      </div>
    </main>
  );
}
