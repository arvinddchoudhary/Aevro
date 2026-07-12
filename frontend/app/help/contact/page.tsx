import type { Metadata } from 'next';
import { pageMetadata } from '../../../lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Contact Us',
  description:
    'Get in touch with AEVRO — reach our support team for order queries, returns, sizing help, or general questions.',
  path: '/help/contact',
});

export default function ContactPage() {
  return (
    <main className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1500px] overflow-hidden rounded-[12px] border border-[#ddd4c8] bg-[#fbf7f0] shadow-[0_22px_70px_rgba(17,17,17,0.08)]">
        <section className="border-b border-[#ddd4c8] bg-[#fffaf3]/70 px-6 py-16 sm:px-12 lg:px-20">
          <div className="max-w-[620px]">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#4d473f]">
              Help
            </p>
            <h1 className="mt-6 font-serif text-[2.55rem] font-light uppercase leading-[0.98] tracking-normal text-[#111111] sm:text-[3.7rem]">
              Contact Us
            </h1>
            <p className="mt-8 max-w-[520px] text-sm leading-7 text-[#3f3932]">
              We are here to help. Reach out to our support team and we will get
              back to you as quickly as possible.
            </p>
          </div>
        </section>

        <section className="border-b border-[#ddd4c8] px-6 py-12 sm:px-12 lg:px-20">
          <div className="max-w-[620px] space-y-8">
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-[#111111]">
                Email
              </h2>
              <p className="mt-4 text-sm leading-7 text-[#3f3932]">
                <a
                  href="mailto:support@aevro.com"
                  className="underline underline-offset-4"
                >
                  support@aevro.com
                </a>
              </p>
              <p className="mt-2 text-sm leading-7 text-[#514c45]">
                We typically respond within 24 hours on business days.
              </p>
            </div>

            <div>
              <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-[#111111]">
                Business Hours
              </h2>
              <div className="mt-4 space-y-2 text-sm leading-7 text-[#3f3932]">
                <p>Monday – Saturday: 10:00 AM – 6:00 PM IST</p>
                <p>Sunday: Closed</p>
              </div>
            </div>

            <div>
              <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-[#111111]">
                Common Questions
              </h2>
              <p className="mt-4 text-sm leading-7 text-[#3f3932]">
                Before reaching out, you may find your answer on one of these pages:
              </p>
              <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
                {[
                  { label: 'Size Guide', href: '/help/size-guide' },
                  { label: 'Shipping', href: '/help/shipping' },
                  { label: 'Returns', href: '/help/returns' },
                  { label: 'FAQs', href: '/help/faq' },
                ].map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    className="text-xs font-semibold uppercase tracking-[0.1em] underline-offset-8 hover:underline"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="px-6 py-12 sm:px-12 lg:px-20">
          <p className="text-sm leading-7 text-[#514c45]">
            We value every message and aim to resolve all queries promptly. Thank
            you for choosing AEVRO.
          </p>
        </section>
      </div>
    </main>
  );
}
