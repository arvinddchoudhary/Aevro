import type { Metadata } from 'next';
import Link from 'next/link';
import { pageMetadata } from '../../lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'AEVRO Lookbook',
  description:
    'The AEVRO lookbook is being prepared. Explore refined trousers and modern essentials while we finish the editorial edit.',
  path: '/lookbook',
  image: '/images/brand/atelier-rack.webp',
});

export default function LookbookPage() {
  return (
    <main className="min-h-screen text-[#111111]">
      <section className="border-b border-[#ddd4c8]">
        <div className="relative min-h-[420px] overflow-hidden sm:min-h-[500px] lg:aspect-[2880/1000] lg:min-h-0">
          <img
            src="/images/brand/atelier-rack.webp"
            alt="AEVRO studio rack with neutral garments"
            className="absolute inset-0 h-full w-full object-cover object-top"
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(251,247,240,0.98)_0%,rgba(251,247,240,0.92)_36%,rgba(251,247,240,0.54)_62%,rgba(251,247,240,0.12)_100%)]" />
          <div className="relative flex min-h-[420px] items-center px-5 py-12 sm:min-h-[500px] sm:px-12 lg:min-h-full lg:px-20 xl:px-28">
            <div className="max-w-xl">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#8b6f4c]">
                Lookbook
              </p>
              <h1 className="mt-5 font-serif text-4xl font-light uppercase leading-[1.02] sm:text-5xl md:text-6xl">
                We are working on it.
              </h1>
              <p className="mt-6 max-w-md text-sm leading-7 text-[#514c45]">
                Our editorial lookbook is being prepared. In the meantime,
                explore the latest AEVRO pieces in the shop.
              </p>
              <Link
                href="/products"
                className="mt-8 inline-flex min-h-12 items-center justify-center border border-[#111111] bg-[#111111] px-8 text-xs font-semibold uppercase tracking-[0.12em] text-[#fffaf3] transition hover:bg-[#fffaf3] hover:text-[#111111]"
              >
                Shop collection
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
