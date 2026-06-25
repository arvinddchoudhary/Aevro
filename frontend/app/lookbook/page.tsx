import fs from 'fs';
import path from 'path';
import Link from 'next/link';
import { LookbookGallery } from '../../components/lookbook/LookbookGallery';

type LookbookCategory = 'day-to-day' | 'workwear' | 'weekend';

type LookbookImage = {
  src: string;
  title: string;
  description: string;
  category: LookbookCategory;
};

const lookbookDetails: Record<string, Omit<LookbookImage, 'src'>> = {
  'Sample2.png': {
    title: 'Midnight polish',
    description: 'Clean black tailoring for sharp days.',
    category: 'workwear',
  },
  'Sample3.png': {
    title: 'Ivory ease',
    description: 'Effortless neutrals for slow weekends.',
    category: 'weekend',
  },
  'Sample4.png': {
    title: 'Warm tone',
    description: 'Soft taupe layers for everyday comfort.',
    category: 'day-to-day',
  },
  'Sample5.png': {
    title: 'Summer white',
    description: 'Crisp and breathable warm-weather style.',
    category: 'weekend',
  },
  'Sample6.png': {
    title: 'Boardroom ready',
    description: 'Tailored taupe for focused days.',
    category: 'workwear',
  },
  'Sample7.png': {
    title: 'Urban contrast',
    description: 'Black and white made modern.',
    category: 'day-to-day',
  },
  'Sample8.png': {
    title: 'Soft weekend',
    description: 'Relaxed knit meets easy trousers.',
    category: 'weekend',
  },
  'Sample9.png': {
    title: 'City layers',
    description: 'Light layers with timeless edge.',
    category: 'day-to-day',
  },
};

function getLookbookImages(): LookbookImage[] {
  const directory = path.join(process.cwd(), 'public', 'images', 'LookBook-Samples');

  try {
    const files = fs.readdirSync(directory);

    return files
      .filter((file) => /\.(jpg|jpeg|png|webp|gif)$/i.test(file))
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
      .map((file) => {
        const details = lookbookDetails[file] ?? {
          title: 'AEVRO look',
          description: 'Timeless style, modern fit.',
          category: 'day-to-day' as LookbookCategory,
        };

        return {
          src: `/images/LookBook-Samples/${file}`,
          ...details,
        };
      });
  } catch {
    return [];
  }
}

export default function LookbookPage() {
  const images = getLookbookImages();

  return (
    <main>
      <section className="border-b border-[#ddd4c8]">
        <div className="relative h-[410px] overflow-hidden sm:h-[460px] lg:h-auto lg:aspect-[2880/1100]">
          <img
            src="/images/brand/atelier-rack.webp"
            alt="AEVRO lookbook studio"
          className="absolute inset-0 h-full w-full object-cover object-top"
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(251,247,240,0.98)_0%,rgba(251,247,240,0.92)_31%,rgba(251,247,240,0.5)_52%,rgba(251,247,240,0.08)_78%)]" />
          <div className="relative flex h-full items-center px-6 py-12 sm:px-12 lg:px-20 xl:px-28">
            <div className="max-w-md">
              <h1 className="text-5xl font-light uppercase leading-none md:text-7xl">
                Lookbook
              </h1>
              <p className="mt-7 text-xs font-medium uppercase tracking-[0.12em]">
                Timeless pieces. Modern moments.
              </p>
              <p className="mt-6 max-w-sm text-sm leading-7 text-[#514c45]">
                A curated edit of versatile looks designed for every part of your
                day.
              </p>
            </div>
          </div>
        </div>
      </section>

      <LookbookGallery images={images} />

      <section className="relative h-[380px] overflow-hidden border-y border-[#ddd4c8] sm:h-[420px] lg:h-[460px]">
        <img
          src="/images/brand/hero-trousers.webp"
          alt="AEVRO tailored trousers"
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
        <div className="relative flex h-full items-center px-6 py-10 sm:px-12 lg:px-16 xl:px-20">
          <div className="max-w-md">
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-[#514c45]">
              AEVRO
            </p>
            <h2 className="mt-4 font-serif text-4xl font-light leading-[1.05] md:text-[3rem]">
              The Difference<br />Is in the Details.
            </h2>
            <p className="mt-5 max-w-sm text-sm leading-7 text-[#514c45]">
              Thoughtful craftsmanship, considered proportions, and premium
              natural fabrics come together to create pieces that move with you
              and stand the test of time.
            </p>
            <div className="mt-6 flex gap-6 sm:gap-10">
              {[
                {
                  label: 'Breathable',
                  icon: (
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12.8 19.6A2 2 0 1 0 14 16H2" />
                      <path d="M17.5 8a2.5 2.5 0 1 1 2 4H2" />
                      <path d="M9.8 4.4A2 2 0 1 1 11 8H2" />
                    </svg>
                  ),
                },
                {
                  label: 'Long-lasting',
                  icon: (
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 7.5a4.5 4.5 0 1 1 4.5 4.5M12 7.5A4.5 4.5 0 1 0 7.5 12M12 7.5V9m-4.5 3a4.5 4.5 0 1 0 4.5 4.5M7.5 12H9m3 4.5V15m4.5-3H15m-3-4.5V6" />
                      <circle cx="12" cy="12" r="2" />
                    </svg>
                  ),
                },
                {
                  label: 'Refined finish',
                  icon: (
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.2 1.2 0 0 0 1.72 0L21.64 5.36a1.2 1.2 0 0 0 0-1.72" />
                      <path d="m14 7 3 3" />
                      <path d="M5 6v4" />
                      <path d="M19 14v4" />
                    </svg>
                  ),
                },
              ].map((item) => (
                <div key={item.label} className="flex flex-col items-center gap-2 text-center">
                  <span className="text-[#111111]">{item.icon}</span>
                  <span className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-[#514c45]">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
            <Link
              href="/products"
              className="mt-6 inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.08em] text-[#111111] underline-offset-8 hover:underline"
            >
              Read about our fabric
              <span className="text-sm">→</span>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
