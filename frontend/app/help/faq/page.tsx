import type { Metadata } from 'next';
import Link from 'next/link';
import { pageMetadata } from '../../../lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Frequently Asked Questions',
  description:
    'Answers to common questions about AEVRO — orders, sizing, shipping, returns, care, and more.',
  path: '/help/faq',
});

const faqs = [
  {
    question: 'What sizes do you offer?',
    answer:
      'We currently offer sizes 28 to 36 across all trouser styles. Please refer to our size guide for detailed measurements.',
  },
  {
    question: 'How do I know which size to choose?',
    answer:
      'Our trousers are designed with a tailored fit through the waist and a gentle taper to the ankle. If you are between sizes, we recommend sizing up for a more relaxed fit. Check the size guide for specific measurements.',
  },
  {
    question: 'What is your return policy?',
    answer:
      'We accept returns within 14 days of delivery. Items must be unworn, unwashed, and returned with all original tags attached. Visit our returns page for full details.',
  },
  {
    question: 'How long does shipping take?',
    answer:
      'Metro cities: 3–5 business days. Rest of India: 5–7 business days. Orders placed before 2 PM IST on business days are typically dispatched the same day.',
  },
  {
    question: 'Is shipping free?',
    answer:
      'Yes — shipping is free on all orders above ₹4,999. A flat fee of ₹149 applies to orders below this threshold.',
  },
  {
    question: 'How do I track my order?',
    answer:
      'Once your order ships, you will receive a confirmation email with a tracking link. You can also check order status from your account page.',
  },
  {
    question: 'How should I care for my AEVRO trousers?',
    answer:
      'We recommend machine washing on a gentle cycle with cold water and hanging to dry. Avoid bleach and tumble drying. Iron on low heat if needed, or steam to remove creases.',
  },
  {
    question: 'Do you ship internationally?',
    answer:
      'We currently ship within India only. International shipping is planned for a future phase.',
  },
];

export default function FaqPage() {
  return (
    <main className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1500px] overflow-hidden rounded-[12px] border border-[#ddd4c8] bg-[#fbf7f0] shadow-[0_22px_70px_rgba(17,17,17,0.08)]">
        <section className="border-b border-[#ddd4c8] bg-[#fffaf3]/70 px-6 py-16 sm:px-12 lg:px-20">
          <div className="max-w-[620px]">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#4d473f]">
              Help
            </p>
            <h1 className="mt-6 font-serif text-[2.55rem] font-light uppercase leading-[0.98] tracking-normal text-[#111111] sm:text-[3.7rem]">
              Frequently Asked Questions
            </h1>
          </div>
        </section>

        <section className="border-b border-[#ddd4c8] px-6 py-12 sm:px-12 lg:px-20">
          <div className="max-w-[700px] divide-y divide-[#ddd4c8]">
            {faqs.map((faq) => (
              <div key={faq.question} className="py-7 first:pt-0 last:pb-0">
                <h2 className="text-sm font-semibold text-[#111111]">
                  {faq.question}
                </h2>
                <p className="mt-3 text-sm leading-7 text-[#514c45]">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="px-6 py-12 sm:px-12 lg:px-20">
          <Link
            href="/help/contact"
            className="inline-flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.1em] underline-offset-8 hover:underline"
          >
            Still have questions? Contact us
            <span aria-hidden="true">→</span>
          </Link>
        </section>
      </div>
    </main>
  );
}
