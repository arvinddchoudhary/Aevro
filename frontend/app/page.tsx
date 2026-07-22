import Link from 'next/link';
import type { Metadata } from 'next';
import { LandingHeroSlider } from '../components/home/LandingHeroSlider';
import { ProductCard } from '../components/products/ProductCard';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorState } from '../components/ui/ErrorState';
import { getProducts } from '../lib/api/catalog';
import { getHomepageSections } from '../lib/api/homepage';
import { getLandingHeroSlides } from '../lib/landing-hero-images';
import { defaultSeoDescription, pageMetadata } from '../lib/seo';
import type { HomepageSection } from '../types/homepage';
import type { Product } from '../types/catalog';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = pageMetadata({
  title: 'AEVRO — Refined Trousers and Modern Essentials',
  description: defaultSeoDescription,
  path: '/',
  image: '/images/brand/hero-trousers.webp',
});

export default async function HomePage() {
  const [catalogResult, homepageResult] = await Promise.allSettled([
    getProducts({ limit: 4, sort: 'newest' }),
    getHomepageSections(),
  ]);
  const heroSlides = await getLandingHeroSlides();
  const products =
    catalogResult.status === 'fulfilled' ? catalogResult.value.data : [];
  const hasCatalogError = catalogResult.status === 'rejected';
  const homepageSections =
    homepageResult.status === 'fulfilled' ? homepageResult.value : [];

  if (homepageSections.length > 0) {
    return (
      <main className="text-[#111111]">
        {homepageSections.map((section) =>
          renderHomepageSection(section, products, hasCatalogError, heroSlides),
        )}
      </main>
    );
  }

  return (
    <main className="text-[#111111]">
      <LandingHeroSlider slides={heroSlides} />
      <MobileHomeBenefits />

      <section className="aevro-container py-6 sm:py-14">
        <div className="mb-4 flex items-center justify-between sm:mb-6">
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.08em] sm:text-xs sm:font-medium">
            Best sellers
          </p>
          <Link href="/products" className="inline-flex items-center gap-2 text-[0.68rem] font-semibold uppercase tracking-[0.08em] underline-offset-8 hover:underline sm:text-xs sm:font-medium">
            View all <span aria-hidden="true">→</span>
          </Link>
        </div>
        {hasCatalogError && (
          <ErrorState
            title="Catalog unavailable"
            message="The product API could not be reached. Check the backend URL and try again."
          />
        )}
        {!hasCatalogError && products.length === 0 && (
          <EmptyState
            title="No products yet"
            message="Once active products are added, they will appear here."
          />
        )}
        {products.length > 0 && (
          <>
          <div className="grid grid-cols-3 gap-2 md:hidden">
            {products.slice(0, 3).map((product) => (
              <div key={product.id} className="min-w-0 [&_button]:h-8 [&_button]:w-8 [&_svg]:h-4 [&_svg]:w-4">
                <ProductCard product={product} compact />
              </div>
            ))}
          </div>
          <div className="hidden gap-4 md:grid md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} compact />
            ))}
          </div>
          </>
        )}
      </section>

      <section className="overflow-hidden border-y border-[#ddd4c8] bg-[#fffaf3] lg:hidden">
        <div className="aspect-[2.15/1] overflow-hidden bg-[#111111]">
          <img
            src="/images/brand/fabric-band.webp"
            alt="Close-up of premium AEVRO fabric"
            className="h-full w-full object-cover object-top"
          />
        </div>
        <div className="px-5 py-7 min-[390px]:px-6">
          <p className="text-[9px] font-semibold uppercase tracking-[0.16em]">
            Fabric first
          </p>
          <h2 className="mt-3 max-w-[20rem] font-serif text-[1.75rem] font-light uppercase leading-[1.08] min-[390px]:text-[1.9rem]">
            The difference is in the details.
          </h2>
          <p className="mt-3 max-w-[22rem] text-[11px] leading-[1.55] text-[#514c45] min-[390px]:text-[12px]">
            Every pair is crafted from carefully selected natural fabrics,
            chosen for their feel, fall, and lasting quality.
          </p>
          <div className="mt-6 grid grid-cols-3 divide-x divide-[#ddd4c8]">
            <article className="min-w-0 pr-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[#8d8173] text-[#6d665d]">
                <HomeBenefitIcon name="leaf" />
              </span>
              <h3 className="mt-3 text-[8px] font-semibold uppercase leading-3 tracking-[0.05em] min-[390px]:text-[8.5px]">
                Premium fabrics
              </h3>
              <p className="mt-1.5 text-[8.5px] leading-[0.82rem] text-[#514c45] min-[390px]:text-[9px]">
                Natural, breathable, and chosen for lasting comfort.
              </p>
            </article>
            <article className="min-w-0 px-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[#8d8173] text-[#6d665d]">
                <HomeBenefitIcon name="hourglass" />
              </span>
              <h3 className="mt-3 text-[8px] font-semibold uppercase leading-3 tracking-[0.05em] min-[390px]:text-[8.5px]">
                Timeless durability
              </h3>
              <p className="mt-1.5 text-[8.5px] leading-[0.82rem] text-[#514c45] min-[390px]:text-[9px]">
                Thoughtfully constructed to stand the test of time.
              </p>
            </article>
            <article className="min-w-0 pl-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[#8d8173] text-[#6d665d]">
                <HomeBenefitIcon name="shield" />
              </span>
              <h3 className="mt-3 text-[8px] font-semibold uppercase leading-3 tracking-[0.05em] min-[390px]:text-[8.5px]">
                Responsible made
              </h3>
              <p className="mt-1.5 text-[8.5px] leading-[0.82rem] text-[#514c45] min-[390px]:text-[9px]">
                Ethically sourced materials with a lighter footprint.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="hidden overflow-hidden border-y border-[#ddd4c8] bg-[#fffaf3] lg:grid lg:grid-cols-[40%_60%]">
        <div className="h-[360px] bg-[#111] sm:h-[420px] lg:h-[520px]">
          <img
            src="/images/brand/fabric-band.webp"
            alt="Close-up of premium AEVRO fabric"
            className="h-full w-full object-cover object-top"
          />
        </div>
        <div className="flex min-h-[360px] items-center px-6 py-12 sm:min-h-[420px] sm:px-12 lg:min-h-[520px] lg:px-20 xl:px-24">
          <div className="w-full max-w-3xl">
            <p className="text-xs font-medium uppercase tracking-[0.1em]">
              Fabric first
            </p>
            <h2 className="mt-5 max-w-xl font-serif text-3xl font-light uppercase leading-[1.08] sm:text-4xl md:text-5xl">
              The difference is in the details.
            </h2>
            <p className="mt-5 max-w-xl text-base leading-7 text-[#514c45]">
              Every pair is crafted from carefully selected natural fabrics,
              chosen for their feel, fall, and lasting quality.
            </p>
            <div className="mt-12 grid gap-8 sm:grid-cols-3">
              <div className="border-[#ddd4c8] sm:border-r sm:pr-8">
                <span className="block text-4xl font-light leading-none text-[#6d665d]">
                  #
                </span>
                <h3 className="mt-7 text-xs font-semibold uppercase tracking-[0.08em]">
                  Premium fabrics
                </h3>
                <p className="mt-3 text-sm leading-6 text-[#514c45]">
                  Natural, breathable, and chosen for lasting comfort.
                </p>
              </div>
              <div className="border-[#ddd4c8] sm:border-r sm:px-8">
                <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[#6d665d] text-xl font-light text-[#6d665d]">
                  ⌚
                </span>
                <h3 className="mt-7 text-xs font-semibold uppercase tracking-[0.08em]">
                  Timeless durability
                </h3>
                <p className="mt-3 text-sm leading-6 text-[#514c45]">
                  Thoughtfully constructed to stand the test of time.
                </p>
              </div>
              <div className="sm:pl-8">
                <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[#6d665d] text-xl font-light text-[#6d665d]">
                  ♧
                </span>
                <h3 className="mt-7 text-xs font-semibold uppercase tracking-[0.08em]">
                  Responsible made
                </h3>
                <p className="mt-3 text-sm leading-6 text-[#514c45]">
                  Ethically sourced materials with a lighter footprint.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative h-[280px] overflow-hidden border-b border-[#ddd4c8] min-[430px]:h-[300px] sm:h-[340px] lg:h-auto lg:min-h-[520px]">
        <img
          src="/images/brand/atelier-band.webp"
          alt="AEVRO studio rack with neutral garments"
          className="absolute inset-0 h-full w-full object-cover object-[68%_center] lg:object-center"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(251,247,240,0.98)_0%,rgba(251,247,240,0.92)_40%,rgba(251,247,240,0.48)_59%,rgba(251,247,240,0)_78%)] lg:hidden" />
        <div className="relative flex h-full items-center px-5 py-6 min-[390px]:px-6 sm:px-10 lg:min-h-[520px] lg:px-20 lg:py-20 xl:px-28">
        <div className="max-w-[52%] sm:max-w-sm lg:max-w-xl">
          <p className="text-[9px] font-semibold uppercase tracking-[0.13em] lg:text-xs lg:font-medium lg:tracking-[0.1em]">
            Our philosophy
          </p>
          <h2 className="mt-3 max-w-xl font-serif text-[1.4rem] font-light uppercase leading-[1.12] min-[390px]:text-[1.55rem] sm:text-3xl lg:mt-4 lg:font-sans lg:text-5xl lg:leading-tight">
            Simplicity. Intention. Lasting style.
          </h2>
          <p className="mt-3 max-w-[11rem] text-[10px] leading-4 text-[#514c45] min-[390px]:text-[10.5px] sm:max-w-xs sm:text-sm sm:leading-6 lg:mt-5 lg:max-w-sm lg:leading-7">
            At AEVRO, true style is found in quality, fit, and the details that
            stand the test of time.
          </p>
          <Link
            href="/about"
            className="mt-4 inline-flex text-[9px] font-semibold uppercase tracking-[0.08em] underline-offset-8 hover:underline sm:text-xs lg:mt-8 lg:font-medium"
          >
            About AEVRO →
          </Link>
        </div>
        </div>
      </section>
    </main>
  );
}

type HomeBenefitIconName =
  | 'leaf'
  | 'needle'
  | 'shield'
  | 'person'
  | 'hourglass';

function HomeBenefitIcon({
  name,
  className = 'h-4 w-4',
}: {
  name: HomeBenefitIconName;
  className?: string;
}) {
  const sharedProps = {
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.35,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
    className,
  };

  if (name === 'leaf') {
    return (
      <svg {...sharedProps}>
        <path d="M19.5 4.5C12 4.7 6.4 8.7 6.4 14.1c0 2.8 2 4.9 4.7 4.9 5.5 0 8.4-6.2 8.4-14.5Z" />
        <path d="M4.5 20c2.7-4.7 6.4-8.1 11.4-10.4" />
      </svg>
    );
  }

  if (name === 'needle') {
    return (
      <svg {...sharedProps}>
        <circle cx="6" cy="6" r="2.5" />
        <circle cx="6" cy="18" r="2.5" />
        <path d="m8 7.5 11 10.5M8 16.5 19 6" />
      </svg>
    );
  }

  if (name === 'shield') {
    return (
      <svg {...sharedProps}>
        <path d="M12 3.5 19 6v5.2c0 4.4-2.5 7.6-7 9.3-4.5-1.7-7-4.9-7-9.3V6l7-2.5Z" />
      </svg>
    );
  }

  if (name === 'hourglass') {
    return (
      <svg {...sharedProps}>
        <path d="M7 4h10M7 20h10M8 4c0 4 1.5 5.5 4 8-2.5 2.5-4 4-4 8M16 4c0 4-1.5 5.5-4 8 2.5 2.5 4 4 4 8" />
      </svg>
    );
  }

  return (
    <svg {...sharedProps}>
      <circle cx="12" cy="7" r="3" />
      <path d="M5.5 20c.8-4.3 3-6.4 6.5-6.4s5.7 2.1 6.5 6.4" />
    </svg>
  );
}

function MobileHomeBenefits() {
  const items = [
    {
      title: 'Premium fabrics',
      detail: 'Carefully selected for lasting comfort.',
      icon: 'leaf',
    },
    {
      title: 'Timeless design',
      detail: 'Refined silhouettes that never go out of style.',
      icon: 'needle',
    },
    {
      title: 'Responsible made',
      detail: 'Ethical production for a better tomorrow.',
      icon: 'shield',
    },
    {
      title: 'Made for real life',
      detail: 'Designed to move with your everyday.',
      icon: 'person',
    },
  ] as const;

  return (
    <section className="border-b border-[#ddd4c8] bg-[#fffaf3] px-3 py-4 lg:hidden">
      <div className="grid grid-cols-4 divide-x divide-[#ddd4c8]">
        {items.map((item) => (
          <article key={item.title} className="min-w-0 px-1.5 text-center min-[390px]:px-2">
            <span className="mx-auto flex h-8 w-8 items-center justify-center rounded-full border border-[#d8cfc2] text-[#111111]">
              <HomeBenefitIcon name={item.icon} />
            </span>
            <h3 className="mt-2 text-[8px] font-semibold uppercase leading-3 tracking-[0.02em] text-[#111111] min-[390px]:text-[8.5px]">
              {item.title}
            </h3>
            <p className="mt-1 text-[8.5px] leading-[0.8rem] text-[#514c45] min-[390px]:text-[9px]">
              {item.detail}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}

function renderHomepageSection(
  section: HomepageSection,
  products: Product[],
  hasCatalogError: boolean,
  heroSlides: string[],
) {
  if (section.type === 'HERO') {
    return (
      <div key={section.id}>
        <LandingHeroSlider
          description={section.description}
          ctaHref={section.ctaHref}
          ctaLabel={section.ctaLabel}
          slides={heroSlides}
        />
        <MobileHomeBenefits />
      </div>
    );
  }

  if (section.type === 'FEATURED_PRODUCTS') {
    return (
      <div key={section.id}>
      <section key={section.id} className="aevro-container py-6 sm:py-14">
        <div className="mb-4 flex items-center justify-between sm:mb-6">
          <div>
            {section.subtitle ? (
              <p className="text-xs font-medium uppercase tracking-[0.08em]">
                {section.subtitle}
              </p>
            ) : null}
            <h2 className="mt-1 text-[0.72rem] font-semibold uppercase tracking-[0.08em] sm:mt-2 sm:text-3xl sm:font-light sm:tracking-normal">
              {section.title ?? 'Best sellers'}
            </h2>
          </div>
          {section.ctaHref ? (
            <Link
              href={section.ctaHref}
              className="inline-flex items-center gap-2 text-[0.68rem] font-semibold uppercase tracking-[0.08em] underline-offset-8 hover:underline sm:text-xs sm:font-medium"
            >
              {section.ctaLabel ?? 'View all'} <span aria-hidden="true">→</span>
            </Link>
          ) : null}
        </div>
        {hasCatalogError ? (
          <ErrorState
            title="Catalog unavailable"
            message="The product API could not be reached. Check the backend URL and try again."
          />
        ) : null}
        {!hasCatalogError && products.length === 0 ? (
          <EmptyState
            title="No products yet"
            message="Once active products are added, they will appear here."
          />
        ) : null}
        {products.length > 0 ? (
          <>
            <div className="grid grid-cols-3 gap-2 md:hidden">
              {products.slice(0, 3).map((product) => (
                <div key={product.id} className="min-w-0 [&_button]:h-8 [&_button]:w-8 [&_svg]:h-4 [&_svg]:w-4">
                  <ProductCard product={product} compact />
                </div>
              ))}
            </div>
            <div className="hidden gap-4 md:grid md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} compact />
              ))}
            </div>
          </>
        ) : null}
      </section>
      </div>
    );
  }

  return (
    <section
      key={section.id}
      className="grid overflow-hidden border-y border-[#ddd4c8] bg-[#fffaf3] lg:grid-cols-2"
    >
      <div className="h-[190px] bg-[#eee8de] sm:h-[300px] lg:h-[560px]">
        <img
          src={section.imageUrl ?? '/images/brand/atelier-band.webp'}
          alt={section.title ?? 'AEVRO homepage section'}
          className="h-full w-full object-cover object-center"
        />
      </div>
      <div className="flex items-center px-5 py-8 sm:min-h-[300px] sm:px-12 lg:min-h-[560px] lg:px-20 lg:py-12 xl:px-28">
        <div className="max-w-xl">
          {section.subtitle ? (
            <p className="text-xs font-medium uppercase tracking-[0.1em]">
              {section.subtitle}
            </p>
          ) : null}
          <h2 className="mt-3 text-2xl font-light uppercase leading-tight sm:mt-5 sm:text-4xl md:text-5xl">
            {section.title ?? 'AEVRO essentials'}
          </h2>
          {section.description ? (
            <p className="mt-3 text-xs leading-5 text-[#514c45] sm:mt-5 sm:text-sm sm:leading-7">
              {section.description}
            </p>
          ) : null}
          {section.ctaLabel && section.ctaHref ? (
            <Link
              href={section.ctaHref}
              className="mt-5 inline-flex text-xs font-medium uppercase tracking-[0.08em] underline-offset-8 hover:underline sm:mt-8"
            >
              {section.ctaLabel} →
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  );
}
