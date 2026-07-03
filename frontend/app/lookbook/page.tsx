import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { pageMetadata } from '../../lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Lookbook',
  description:
    'Explore the upcoming AEVRO lookbook and discover premium trouser styling across everyday, workwear, and weekend moments.',
  path: '/lookbook',
  image: '/images/LookBook-Samples/hero-lookbook.webp',
});

const editorialCards = [
  {
    number: '01',
    title: 'Day to Day',
    copy: 'Preview coming soon.',
    image: '/images/LookBook-Samples/day-to-day.webp',
    alt: 'AEVRO trousers styled for daily wear',
    imagePosition: 'object-left center',
  },
  {
    number: '02',
    title: 'Workwear',
    copy: 'Preview coming soon.',
    image: '/images/LookBook-Samples/workwear.webp',
    alt: 'AEVRO tailored trousers styled for workwear',
    imagePosition: 'object-center',
  },
  {
    number: '03',
    title: 'Weekend',
    copy: 'Preview coming soon.',
    image: '/images/LookBook-Samples/weekend.webp',
    alt: 'Folded AEVRO trousers in a relaxed weekend setting',
    imagePosition: 'object-right center',
  },
] as const;

const featureItems = [
  {
    type: 'statement',
    title: 'Timeless trousers. Modern refinement. Designed to move with you.',
  },
  {
    title: 'Premium fabrics',
    copy: 'Responsibly sourced, carefully selected.',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M7.5 4.5 19.5 16.5" />
        <path d="M16.5 4.5 4.5 16.5" />
        <circle cx="7.5" cy="7.5" r="3" />
        <circle cx="16.5" cy="13.5" r="3" />
      </svg>
    ),
  },
  {
    title: 'Tailored fits',
    copy: 'Thoughtful silhouettes, everyday comfort.',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="8" />
        <path d="m8.5 12 2.2 2.2 4.8-5" />
      </svg>
    ),
  },
  {
    title: 'Built to last',
    copy: 'Quality you can feel. Wear after wear.',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M6.5 9h11l1 10.5h-13L6.5 9Z" />
        <path d="M9 9V6.8a3 3 0 0 1 6 0V9" />
      </svg>
    ),
  },
] as const;

export default function LookbookPage() {
  return (
    <main className="bg-[#fbf7f0] text-[#111111]">
      <section className="border-b border-[#ddd4c8]">
        <div className="grid overflow-hidden lg:min-h-[420px] lg:grid-cols-[44%_56%] xl:min-h-[450px]">
          <div className="flex items-center px-6 py-12 sm:px-10 md:px-16 lg:px-20 lg:py-10 xl:px-28">
            <div className="max-w-[520px]">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-[#8a663e]">
                Lookbook
              </p>
              <h1 className="mt-5 font-serif text-[2.45rem] font-light uppercase leading-[0.98] tracking-[0.01em] sm:text-[3.1rem] md:text-[3.55rem] lg:text-[3.45rem] xl:text-[3.9rem]">
                The Lookbook
                <br />
                Arrives Soon
              </h1>
              <p className="mt-6 max-w-[440px] text-sm leading-7 text-[#514c45]">
                Our editorial lookbook is in the works. In the meantime,
                explore how AEVRO trousers move through every part of your life.
              </p>
              <Link
                href="mailto:theaevro.official@gmail.com?subject=AEVRO%20Lookbook%20Notification"
                className="mt-8 inline-flex h-11 min-w-44 cursor-pointer items-center justify-center bg-[#111111] px-7 text-[0.7rem] font-semibold uppercase leading-none tracking-[0.16em] text-white transition hover:bg-[#2a2825]"
              >
                <span className="text-white">Get notified</span>
              </Link>
            </div>
          </div>
          <div className="relative min-h-[300px] sm:min-h-[360px] lg:min-h-full">
            <Image
              src="/images/LookBook-Samples/hero-lookbook.webp"
              alt="Stacked AEVRO trousers in black, charcoal, stone, beige, and ivory"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 56vw"
              className="object-cover object-center lg:object-[58%_center]"
            />
          </div>
        </div>
      </section>

      <section className="px-5 py-7 sm:px-8 sm:py-8 lg:px-12 xl:px-16">
        <div className="mx-auto grid max-w-[1780px] gap-5 lg:grid-cols-3 xl:gap-6">
          {editorialCards.map((card) => (
            <article
              key={card.number}
              className="group relative min-h-[260px] overflow-hidden rounded-[6px] border border-[#ddd4c8] bg-[#eee5da] shadow-[0_18px_50px_rgba(49,37,26,0.035)] sm:min-h-[300px] lg:min-h-[260px] xl:min-h-[285px]"
            >
              <Image
                src={card.image}
                alt={card.alt}
                fill
                sizes="(max-width: 1024px) 100vw, 33vw"
                className={`object-cover ${card.imagePosition} transition duration-700 group-hover:scale-[1.025]`}
              />
              <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(251,247,240,0.05)_0%,rgba(251,247,240,0.66)_54%,rgba(251,247,240,0.93)_100%)]" />
              <div className="absolute inset-y-0 right-0 flex w-[54%] min-w-[200px] items-center px-5 sm:px-7">
                <div className="w-full">
                  <p className="text-xs text-[#5c5147]">{card.number}</p>
                  <div className="mt-3 h-px w-full bg-[#b6aa9a]" />
                  <h2 className="mt-5 font-serif text-2xl font-light leading-none text-[#111111] sm:text-3xl">
                    {card.title}
                  </h2>
                  <div className="mt-5 h-px w-5 bg-[#111111]" />
                  <p className="mt-5 text-xs text-[#5f574f] sm:text-sm">{card.copy}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="px-5 pb-8 sm:px-8 lg:px-12 xl:px-16">
        <div className="mx-auto grid max-w-[1780px] overflow-hidden rounded-[6px] border border-[#eadfd2] bg-[#fffaf3]/72 shadow-[0_18px_60px_rgba(49,37,26,0.035)] md:grid-cols-2 xl:grid-cols-[1.12fr_repeat(3,1fr)]">
          {featureItems.map((item, index) => (
            <article
              key={item.title}
              className={`min-h-[90px] border-[#eadfd2] px-7 py-5 ${
                index < featureItems.length - 1
                  ? 'border-b md:border-r xl:border-b-0'
                  : ''
              } ${index === 1 ? 'md:border-b xl:border-b-0' : ''}`}
            >
              {'type' in item ? (
                <p className="max-w-sm font-serif text-base italic leading-6 text-[#514c45]">
                  {item.title}
                </p>
              ) : (
                <div className="flex items-start gap-4">
                  <span className="mt-0.5 block h-5 w-5 shrink-0 text-[#4a4037] [&_svg]:h-full [&_svg]:w-full [&_svg]:fill-none [&_svg]:stroke-current [&_svg]:stroke-[1.25]">
                    {item.icon}
                  </span>
                  <div>
                    <h3 className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-[#211d18]">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-xs leading-5 text-[#62574c] sm:text-sm">
                      {item.copy}
                    </p>
                  </div>
                </div>
              )}
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
