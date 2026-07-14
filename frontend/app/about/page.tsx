import type { Metadata } from 'next';
import Link from 'next/link';
import { pageMetadata } from '../../lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'About AEVRO',
  description:
    'Learn about AEVRO, a modern essentials brand focused on refined trousers, lasting design, thoughtful construction, and timeless everyday style.',
  path: '/about',
  image: '/images/brand/About-Top-Image.webp',
});

const values = [
  {
    title: 'Timeless design',
    copy: 'We believe in creating pieces that never go out of style: refined, versatile, and enduring.',
    icon: (
      <svg viewBox="0 0 32 32" aria-hidden="true">
        <path d="M16 3v26M3 16h26M6.8 6.8l18.4 18.4M25.2 6.8 6.8 25.2" />
        <circle cx="16" cy="16" r="5.5" />
      </svg>
    ),
  },
  {
    title: 'Quality first',
    copy: 'Premium fabrics, meticulous craftsmanship, and attention to detail in everything we do.',
    icon: (
      <svg viewBox="0 0 32 32" aria-hidden="true">
        <path d="M10 4h12M10 28h12M13 8c0 4 6 4 6 8s-6 4-6 8M19 8c0 4-6 4-6 8s6 4 6 8" />
      </svg>
    ),
  },
  {
    title: 'Responsible made',
    copy: 'We take responsibility for our impact: ethical production, conscious choices, better future.',
    icon: (
      <svg viewBox="0 0 32 32" aria-hidden="true">
        <circle cx="16" cy="16" r="11" />
        <path d="M21 10c-6 1-10 5-10 11 6-1 10-5 10-11Z" />
        <path d="M12 20c3-1 5-3 7-6" />
      </svg>
    ),
  },
  {
    title: 'Made for real life',
    copy: 'Clothing that fits your life beautifully: comfort, function, and effortless style.',
    icon: (
      <svg viewBox="0 0 32 32" aria-hidden="true">
        <circle cx="16" cy="10" r="5" />
        <path d="M7 28c1.2-6 4.4-9 9-9s7.8 3 9 9" />
      </svg>
    ),
  },
];

export default function AboutPage() {
  return (
    <main className="bg-[#fbf7f0] md:px-4 md:py-6 lg:px-8">
      <div className="pb-8 md:hidden">
        <section className="relative h-[430px] overflow-hidden border-b border-[#ddd4c8] bg-[#fbf7f0]">
          <div className="absolute inset-0">
            <img
              src="/images/brand/About-Top-Image.webp"
              alt="Folded AEVRO trousers in a calm studio setting"
              className="h-full w-full object-cover object-[68%_center]"
            />
          </div>
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(251,247,240,0.99)_0%,rgba(251,247,240,0.97)_46%,rgba(251,247,240,0.72)_58%,rgba(251,247,240,0.08)_76%)]" />
          <div className="relative flex h-full w-[56%] flex-col justify-center px-5 py-7 min-[390px]:px-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#4d473f]">
              Our story
            </p>
            <h1 className="mt-4 font-serif text-[1.65rem] font-light uppercase leading-[1.02] tracking-normal text-[#111111] min-[390px]:text-[1.8rem]">
              Built on simplicity. Driven by purpose.
            </h1>
            <div className="mt-4 text-[12px] leading-[1.55] text-[#3f3932]">
              <p>
                AEVRO was created with a simple idea: everyday clothing should feel thoughtfully
                designed. We begin with the pleated trouser: a timeless silhouette built with
                structure, ease, and versatility.
              </p>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-2 gap-2 px-3 py-4">
          {values.map((value) => (
            <article
              key={value.title}
              className="min-h-[134px] rounded-[8px] border border-[#ddd4c8] bg-[#fffaf3]/70 px-3 py-4 text-center"
            >
              <span className="mx-auto block h-7 w-7 text-[#111111] [&_svg]:h-full [&_svg]:w-full [&_svg]:fill-none [&_svg]:stroke-current [&_svg]:stroke-[1.15]">
                {value.icon}
              </span>
              <h2 className="mt-3 text-[10px] font-semibold uppercase leading-4 tracking-[0.15em]">
                {value.title}
              </h2>
              <p className="mt-2 text-[12px] leading-[1.45] text-[#514c45]">{value.copy}</p>
            </article>
          ))}
        </section>

        <section className="space-y-3 px-3 pb-7">
          <article className="relative h-[300px] overflow-hidden rounded-[10px] border border-[#ddd4c8] bg-[#fbf7f0]">
            <div className="absolute inset-0 bg-[#111111]">
              <img
                src="/images/brand/fabric-detail.webp"
                alt="AEVRO tailoring craftsmanship"
                className="h-full w-full object-cover object-[58%_top]"
              />
            </div>
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(10,10,10,0.98)_0%,rgba(10,10,10,0.94)_48%,rgba(10,10,10,0.6)_60%,rgba(10,10,10,0.08)_78%)]" />
            <div className="relative flex h-full w-[55%] flex-col justify-center px-4 py-5 text-[#fbf7f0] min-[390px]:px-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#d8cec0]">
                Craftsmanship
              </p>
              <h2 className="mt-3 font-serif text-[1.02rem] font-light uppercase leading-[1.14] tracking-normal min-[390px]:text-[1.08rem]">
                <span className="block">Expert tailoring.</span>
                <span className="block">Premium fabrics.</span>
                <span className="block">Timeless design.</span>
              </h2>
              <p className="mt-3 text-[11px] leading-[1.5] text-[#ebe1d4]">
                Every garment begins with careful material selection, precise construction, and
                close attention to finishing details.
              </p>
              <Link
                href="/products"
                className="mt-4 inline-flex w-fit items-center gap-2 border-b border-[#fbf7f0] pb-1 text-[9px] font-semibold uppercase tracking-[0.1em]"
              >
                Explore our collections
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          </article>

          <article className="relative h-[340px] overflow-hidden rounded-[10px] border border-[#ddd4c8] bg-[#fbf7f0]">
            <div className="absolute inset-0">
              <img
                src="/images/brand/hero-trousers.webp"
                alt="AEVRO trousers styled in a calm studio"
                className="h-full w-full object-cover object-[68%_center]"
              />
            </div>
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(251,247,240,0.99)_0%,rgba(251,247,240,0.96)_46%,rgba(251,247,240,0.68)_59%,rgba(251,247,240,0.05)_78%)]" />
            <div className="relative flex h-full w-[55%] flex-col justify-center px-4 py-5 min-[390px]:px-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#514c45]">
                Sustainability
              </p>
              <h2 className="mt-3 font-serif text-[1.12rem] font-light uppercase leading-[1.08] tracking-normal text-[#111111] min-[390px]:text-[1.2rem]">
                <span className="block">Better choices.</span>
                <span className="block">Greater impact.</span>
              </h2>
              <p className="mt-3 text-[11px] leading-[1.5] text-[#514c45]">
                Responsible fashion starts with thoughtful design, timeless garments, and pieces
                made to last beyond trends.
              </p>
              <Link
                href="/lookbook"
                className="mt-4 inline-flex w-fit items-center gap-2 border-b border-[#111111] pb-1 text-[9px] font-semibold uppercase tracking-[0.12em]"
              >
                Our commitment
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          </article>
        </section>
      </div>

      <div className="mx-auto hidden max-w-[1500px] overflow-hidden rounded-[12px] border border-[#ddd4c8] bg-[#fbf7f0] shadow-[0_22px_70px_rgba(17,17,17,0.08)] md:block">
        <section className="border-b border-[#ddd4c8]">
          <div className="relative h-[540px] overflow-hidden md:h-auto md:aspect-[2029/775]">
            <img
              src="/images/brand/About-Top-Image.webp"
              alt="Folded AEVRO trousers in a calm studio setting"
              className="absolute inset-0 h-full w-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(251,247,240,0.98)_0%,rgba(251,247,240,0.92)_31%,rgba(251,247,240,0.5)_50%,rgba(251,247,240,0.04)_76%)]" />
            <div className="relative flex h-full items-center px-6 py-12 sm:px-12 lg:px-20">
              <div className="max-w-[470px]">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#4d473f]">
                  Our story
                </p>
                <h1 className="mt-6 font-serif text-[2.55rem] font-light uppercase leading-[0.98] tracking-normal text-[#111111] sm:text-[4.8rem] lg:text-[3.7rem]">
                  Built on simplicity. Driven by purpose.
                </h1>
                <div className="mt-8 max-w-[390px] space-y-3   text-sm leading-7 text-[#3f3932]">
                      <p>
                        AEVRO was created with a simple idea: everyday clothing should feel thoughtfully
                        designed.
                        We begin with one product the pleated trouser. A timeless silhouette built
                        with structure, ease, and versatility for work, travel, and everyday life.
                    </p>
                    <p>
                        Instead of chasing trends, we focus on refined proportions, lasting design,
                        and careful construction.
                      </p>

                      <p>This is only the beginning, 
                        <br />
                        Welcome to AEVRO.</p>

                      <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2">
                        {[
                          { label: 'Our Story', href: '/about/our-story' },
                          { label: 'Philosophy', href: '/about/philosophy' },
                          { label: 'Craftsmanship', href: '/about/craftsmanship' },
                          { label: 'Sustainability', href: '/about/sustainability' },
                        ].map((sub) => (
                          <Link
                            key={sub.href}
                            href={sub.href}
                            className="text-xs font-semibold uppercase tracking-[0.1em] text-[#4d473f] underline-offset-8 hover:underline"
                          >
                            {sub.label}
                          </Link>
                        ))}
                      </div>
              </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid border-b border-[#ddd4c8] bg-[#fffaf3]/70 sm:grid-cols-2 lg:grid-cols-4">
          {values.map((value) => (
            <article
              key={value.title}
              className="flex min-h-[220px] flex-col items-center justify-center border-b border-[#ddd4c8] px-8 py-9 text-center last:border-b-0 sm:even:border-l lg:border-b-0 lg:border-l lg:first:border-l-0"
            >
              <span className="block h-11 w-11 text-[#111111] [&_svg]:h-full [&_svg]:w-full [&_svg]:fill-none [&_svg]:stroke-current [&_svg]:stroke-[1.15]">
                {value.icon}
              </span>
              <h2 className="mt-6 text-xs font-semibold uppercase tracking-[0.1em]">
                {value.title}
              </h2>
              <p className="mt-4 max-w-[230px] text-sm leading-6 text-[#514c45]">
                {value.copy}
              </p>
            </article>
          ))}
        </section>

        <section className="grid border-b border-[#ddd4c8] lg:grid-cols-2">
          <div className="relative min-h-[440px] overflow-hidden bg-[#eee6da]">
            <img
              src="/images/brand/fabric-detail.webp"
              alt="AEVRO tailoring craftsmanship"
              className="absolute inset-0 h-full w-full object-cover object-top"
            />
          </div>
          <div className="flex min-h-[440px] items-center px-6 py-14 sm:px-12 lg:px-20">
            <div className="max-w-[470px]">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#514c45]">
                Craftsmanship
              </p>
              <h2 className="mt-6 font-serif text-4xl font-light uppercase leading-[1.04] tracking-normal text-[#111111] sm:text-5xl">
                Expert tailoring. Premium fabrics. Timeless design.
              </h2>
              <p className="mt-7 text-sm leading-7 text-[#514c45]">
                Every AEVRO garment begins with careful material selection and precise pattern development.
                Our signature pleated trousers are designed with clean construction, balanced proportions, 
                and attention to finishing details. From stitching to pressing, every stage is approached with 
                consistency and care.
              </p>
              <Link
                href="/products"
                className="mt-8 inline-flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.1em] underline-offset-8 hover:underline"
              >
                Explore our collections
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </section>

        <section className="grid lg:grid-cols-2">
          <div className="flex min-h-[420px] items-center px-6 py-14 sm:px-12 lg:px-20">
            <div className="max-w-[430px]">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#514c45]">
                Sustainability
              </p>
              <h2 className="mt-6 font-serif text-4xl font-light uppercase leading-[1.04] tracking-normal text-[#111111] sm:text-5xl">
                Better choices. Greater impact.
              </h2>
              <p className="mt-7 text-sm leading-7 text-[#514c45]">
                We believe responsible fashion starts with thoughtful design.
                AEVRO focuses on timeless garments instead of large seasonal collections, 
                creating pieces made to last beyond trends.
                Through considered production, durable materials, and long-term wear, 
                we aim to reduce waste. As we grow, we will continue improving our 
                sourcing, packaging, and manufacturing practices.
              </p>
              <Link
                href="/lookbook"
                className="mt-8 inline-flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.1em] underline-offset-8 hover:underline"
              >
                Our commitment
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
          <div className="relative min-h-[420px] overflow-hidden bg-[#eee6da]">
            <img
              src="/images/brand/about-Page-Sample2.webp"
              alt="AEVRO studio rack and chair"
              className="absolute inset-0 h-full w-full object-cover object-center"
            />
          </div>
        </section>
      </div>
    </main>
  );
}
