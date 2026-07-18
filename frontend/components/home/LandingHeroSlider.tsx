'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

const heroSlides = [
  '/images/Landing-Page-Hero-Section/Sample1.png',
  '/images/Landing-Page-Hero-Section/Sample2.png',
  '/images/Landing-Page-Hero-Section/Sample3.png',
  '/images/Landing-Page-Hero-Section/Sample4.png',
] as const;

type LandingHeroSliderProps = {
  description?: string | null;
  ctaHref?: string | null;
  ctaLabel?: string | null;
};

export function LandingHeroSlider({
  description = 'Refined trousers and elevated essentials crafted for the way you live and dress.',
  ctaHref = '/products',
  ctaLabel = 'Shop trousers',
}: LandingHeroSliderProps) {
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setActiveSlide((currentSlide) => (currentSlide + 1) % heroSlides.length);
    }, 3000);

    return () => window.clearInterval(intervalId);
  }, []);

  const buttonLabel = ctaLabel?.trim() || 'Shop trousers';
  const descriptionText = description?.trim() || 'Refined trousers and elevated essentials crafted for the way you live and dress.';

  return (
    <section className="border-b border-[#ddd4c8]">
      <div className="relative h-[300px] overflow-hidden bg-[#fbf7f0] min-[390px]:h-[310px] min-[430px]:h-[320px] md:h-[500px] lg:h-[560px] xl:h-[600px]">
        {heroSlides.map((src, index) => (
          <img
            key={src}
            src={src}
            alt="AEVRO tailored trousers"
            className={`absolute inset-0 h-full w-full object-cover object-[64%_center] transition-opacity duration-700 ease-out motion-reduce:transition-none md:object-contain md:object-right ${
              index === activeSlide ? 'opacity-100' : 'pointer-events-none opacity-0'
            }`}
          />
        ))}
        <div className="absolute inset-0 bg-[linear-gradient(90deg,#fbf7f0_0%,rgba(251,247,240,0.97)_38%,rgba(251,247,240,0.72)_57%,rgba(251,247,240,0.08)_82%,rgba(251,247,240,0)_100%)] md:bg-[linear-gradient(90deg,rgba(251,247,240,0.82)_0%,rgba(251,247,240,0.72)_28%,rgba(251,247,240,0.2)_52%,rgba(251,247,240,0)_76%)]" />

        <div className="relative z-10 flex h-full items-start px-5 pb-10 pt-6 min-[390px]:px-6 min-[390px]:pt-7 md:items-center md:px-12 md:py-12 lg:min-h-full lg:px-20 xl:px-28">
          <div className="max-w-[220px] min-w-0 md:max-w-[520px] lg:max-w-2xl">
            <p className="max-w-[9rem] text-[9px] font-semibold uppercase leading-[0.95rem] tracking-[0.08em] min-[390px]:text-[10px] md:max-w-none md:text-xs md:leading-5">
              <span className="block">Timeless form.</span>
              <span className="block">Modern presence.</span>
            </p>
            <h1 className="mt-2.5 max-w-[240px] text-[32px] font-light uppercase leading-[0.95] tracking-normal min-[390px]:text-[34px] md:mt-5 md:max-w-none md:text-[clamp(64px,7vw,96px)]">
              <span className="block">Tailored</span>
              <span className="block whitespace-nowrap">to define.</span>
            </h1>
            <p className="mt-2.5 max-w-[190px] text-[11px] leading-[1.5] text-[#514c45] min-[390px]:text-[12px] md:mt-5 md:max-w-sm md:text-sm md:leading-7 lg:mt-6 lg:max-w-md">
              {descriptionText}
            </p>
            <Link
              href={ctaHref || '/products'}
              className="group mt-3 inline-flex h-11 w-[160px] items-center justify-center gap-2.5 rounded-[3px] border border-[#111111] bg-[#111111] px-3 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#fffaf3] shadow-[0_10px_22px_rgba(17,17,17,0.12)] transition duration-300 hover:bg-[#fffaf3] hover:text-[#111111] md:mt-6 md:min-h-[3.25rem] md:min-w-44 md:w-auto md:gap-4 md:rounded-[4px] md:px-7 md:py-3.5 md:text-xs md:shadow-[0_12px_28px_rgba(17,17,17,0.13)] lg:mt-8 lg:px-8 lg:py-4 lg:text-sm"
            >
              <span className="text-[#fffaf3] group-hover:text-[#111111]">{buttonLabel}</span>
              <span className="text-[#fffaf3] group-hover:text-[#111111]" aria-hidden="true">→</span>
            </Link>
          </div>
        </div>

        <div className="absolute bottom-2.5 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1.5 md:bottom-6" aria-label="Hero slides">
          {heroSlides.map((src, index) => (
            <button
              key={src}
              type="button"
              aria-label={`Show hero image ${index + 1}`}
              aria-current={index === activeSlide ? 'true' : undefined}
              onClick={() => setActiveSlide(index)}
              className={`rounded-full transition-all duration-300 motion-reduce:transition-none ${
                index === activeSlide
                  ? 'h-1.5 w-5 bg-[#111111]'
                  : 'h-1.5 w-1.5 bg-[#fffaf3] hover:bg-[#111111]'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
