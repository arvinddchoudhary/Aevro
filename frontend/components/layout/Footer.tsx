'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BenefitStrip } from './BenefitStrip';

const serviceItems = [
  {
    title: 'Free shipping',
    detail: 'On all orders above ₹ 4999',
    icon: (
      <svg viewBox="0 0 96 96" aria-hidden="true" className="h-12 w-12 sm:h-14 sm:w-14">
        <path d="M12 57h44V25H12v32Z" fill="none" stroke="currentColor" strokeWidth="3" />
        <path d="M56 38h14l12 13v6H56V38Z" fill="none" stroke="currentColor" strokeWidth="3" />
        <path d="M20 66a7 7 0 1 0 14 0 7 7 0 0 0-14 0ZM66 66a7 7 0 1 0 14 0 7 7 0 0 0-14 0Z" fill="none" stroke="currentColor" strokeWidth="3" />
        <path d="M8 66h12M34 66h32M80 66h8M10 34H3M10 43H0M10 52H5" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="3" />
      </svg>
    ),
  },
  {
    title: 'Easy returns',
    detail: '14 days return policy',
    icon: (
      <svg viewBox="0 0 96 96" aria-hidden="true" className="h-12 w-12 sm:h-14 sm:w-14">
        <path d="M32 32 48 23l16 9-16 9-16-9Z" fill="none" stroke="currentColor" strokeWidth="3" />
        <path d="M32 32v22l16 10 16-10V32M48 41v23" fill="none" stroke="currentColor" strokeWidth="3" />
        <path d="M25 22a34 34 0 0 1 47 4l6 7M78 20v13H65M71 74a34 34 0 0 1-47-4l-6-7M18 76V63h13" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" />
      </svg>
    ),
  },
  {
    title: 'Secure payments',
    detail: '100% secure checkout',
    icon: (
      <svg viewBox="0 0 96 96" aria-hidden="true" className="h-12 w-12 sm:h-14 sm:w-14">
        <path d="M48 12 76 24v20c0 18-11 31-28 40-17-9-28-22-28-40V24l28-12Z" fill="none" stroke="currentColor" strokeWidth="3" />
        <path d="M37 46h22v17H37V46ZM42 46v-7a6 6 0 0 1 12 0v7" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="3" />
      </svg>
    ),
  },
  {
    title: 'Customer support',
    detail: 'support@aevro.com',
    icon: (
      <svg viewBox="0 0 96 96" aria-hidden="true" className="h-12 w-12 sm:h-14 sm:w-14">
        <path d="M22 55v-9a26 26 0 0 1 52 0v9" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="3" />
        <path d="M15 53c0-5 3-9 7-9h5v23h-5c-4 0-7-4-7-9v-5ZM81 53c0-5-3-9-7-9h-5v23h5c4 0 7-4 7-9v-5Z" fill="none" stroke="currentColor" strokeWidth="3" />
        <path d="M38 38h20c7 0 12 5 12 11s-5 11-12 11H48l-10 8v-8c-7 0-12-5-12-11s5-11 12-11Z" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" />
        <path d="M41 49h.5M48 49h.5M55 49h.5" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="4" />
      </svg>
    ),
  },
];

const compactServiceItems = [
  {
    code: 'FS',
    title: 'Free shipping',
    detail: 'On all orders above ₹ 4999',
  },
  {
    code: 'ER',
    title: 'Easy returns',
    detail: '14 days return policy',
  },
  {
    code: 'SP',
    title: 'Secure payments',
    detail: '100% secure checkout',
  },
  {
    code: 'CS',
    title: 'Customer support',
    detail: 'support@aevro.com',
  },
];

const footerGroups = [
  {
    title: 'Shop',
    links: ['Trousers'],
  },
  {
    title: 'Collections',
    links: ['Signature Pleats ', 'Core Collection', 'Launch Collection', ],
  },
  {
    title: 'About',
    links: ['Our Story', 'Philosophy', 'Craftsmanship', 'Sustainability'],
  },
  {
    title: 'Help',
    links: ['Size Guide','Orders & Shipping', 'Returns & Exchanges', 'Contact Us', 'FAQs' ],
  },
];

export function ServiceBenefitsPanel({ className = '' }: { className?: string }) {
  return (
    <div
      className={`grid overflow-hidden rounded-[12px] border border-[#eadfd2] bg-[#fffaf3]/80 shadow-[0_16px_48px_rgba(49,37,26,0.04)] sm:grid-cols-2 lg:grid-cols-4 ${className}`}
    >
      {serviceItems.map((item, index) => {
        const mobileBorder = index < serviceItems.length - 1 ? 'border-b border-[#eadfd2]' : '';
        const tabletBorder = index % 2 === 0 ? 'sm:border-r' : 'sm:border-r-0';
        const tabletBottom = index < 2 ? 'sm:border-b' : 'sm:border-b-0';
        const desktopBorder = index < serviceItems.length - 1 ? 'lg:border-r' : 'lg:border-r-0';

        return (
          <article
            key={item.title}
            className={`flex min-h-[104px] flex-col items-center justify-center px-4 py-5 text-center sm:min-h-[132px] sm:px-6 sm:py-6 lg:min-h-[150px] lg:border-b-0 ${mobileBorder} ${tabletBorder} ${tabletBottom} ${desktopBorder}`}
          >
            <div className="text-[#9b8970]">{item.icon}</div>
            <h3 className="mt-3 text-xs font-semibold uppercase tracking-[0.22em] text-[#211d18] sm:mt-4 sm:text-sm lg:font-serif lg:text-base lg:tracking-[0.28em]">
              {item.title}
            </h3>
            <span className="mt-3 h-px w-8 bg-[#d6c0a5]" aria-hidden="true" />
            <p className="mt-3 text-xs leading-5 text-[#62574c] sm:text-sm">{item.detail}</p>
          </article>
        );
      })}
    </div>
  );
}

export function ServiceBenefitsStrip({ className = '' }: { className?: string }) {
  return (
    <section className={`px-4 py-5 sm:px-6 sm:py-8 lg:px-10 lg:py-10 ${className}`}>
      <ServiceBenefitsPanel className="mx-auto max-w-[1820px]" />
    </section>
  );
}

function CompactServiceStrip() {
  return (
    <section className="border-y border-[#ddd4c8] bg-[#fffaf2] px-3 py-3 sm:px-4 sm:py-4">
      <div className="mx-auto grid max-w-7xl gap-2 rounded-lg border border-[#ddd4c8] px-3 py-3 sm:grid-cols-2 sm:gap-4 sm:px-5 sm:py-4 lg:grid-cols-4">
        {compactServiceItems.map((item) => (
          <article
            key={item.title}
            className="flex min-w-0 items-center gap-3 border-[#ddd4c8] py-1 lg:border-r lg:pr-8 lg:last:border-r-0"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center border border-[#111111] text-[10px] uppercase tracking-[0.18em] text-[#111111]">
              {item.code}
            </span>
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-[#111111]">
                {item.title}
              </h3>
              <p className="mt-1 break-words text-xs text-[#5f574f]">{item.detail}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function shouldShowPremiumServiceStrip(pathname: string) {
  return (
    pathname === '/' ||
    pathname === '/about' ||
    pathname === '/lookbook' ||
    pathname === '/product' ||
    pathname.startsWith('/product/') ||
    pathname === '/products' ||
    pathname.startsWith('/products/')
  );
}

function shouldShowFooterServiceStrip(pathname: string) {
  return !pathname.startsWith('/account');
}

export function Footer() {
  const pathname = usePathname();

  return (
    <footer className="border-t border-[#ddd4c8] bg-[#fbf7f0]">
      {shouldShowFooterServiceStrip(pathname) && <BenefitStrip />}

      <section className="border-t border-[#ddd4c8] bg-[#f3eadf]/55">
        <div className="aevro-container grid gap-8 py-8 lg:grid-cols-[1.1fr_2fr_1fr] lg:py-9">
        <div>
          <Link href="/" className="inline-flex" aria-label="AEVRO home">
            <img
              src="/images/brand/aevro-wordmark.png"
              alt="AEVRO"
              className="h-10 w-auto md:h-11"
            />
          </Link>
          <p className="mt-5 max-w-xs text-sm leading-6 text-[#514c45]">
            Modern essentials. Timeless design. Thoughtfully made to move with
            you, every day.
          </p>
          <div className="mt-6 flex gap-4 text-sm">
            <span>Instagram</span>
            <span>Facebook</span>
            <span>Pinterest</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 sm:grid-cols-4 sm:gap-8">
          {footerGroups.map((group) => (
            <div key={group.title}>
              <p className="text-xs font-medium uppercase tracking-[0.08em]">
                {group.title}
              </p>
              <div className="mt-4 space-y-2 text-sm text-[#514c45]">
                {group.links.map((link) =>
                  group.title === 'Shop' ? (
                    <Link
                      key={link}
                      href="/products"
                      className="block underline-offset-4 hover:underline"
                    >
                      {link}
                    </Link>
                  ) : (
                    <span key={link} className="block text-[#6d665d]">
                      {link}
                    </span>
                  ),
                )}
              </div>
            </div>
          ))}
        </div>

        <div>
          <p className="text-xs font-medium uppercase tracking-[0.08em]">
             Join AEVRO.
          </p>
          <p className="mt-4 text-sm leading-6 text-[#514c45]">
           
Be the first to discover new collections, restocks, and exclusive releases.
          </p>
          <div className="mt-6 flex min-w-0 border-b border-[#111111]">
            <input
              placeholder="Email address"
              className="h-11 min-w-0 flex-1 bg-transparent text-sm outline-none"
            />
            <button className="px-2 text-xl" aria-label="Submit email">
              →
            </button>
          </div>
        </div>
        </div>
      </section>

      <section className="border-t border-[#ddd4c8]">
        <div className="aevro-container flex flex-col gap-3 py-6 text-xs text-[#514c45] sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 AEVRO. All rights reserved.</p>
          <div className="flex flex-wrap gap-x-8 gap-y-2">
            <span>Privacy Policy</span>
            <span>Shipping Policy</span>
            <span>Return Policy</span>
            <span>Terms & Conditions</span>

          </div>
        </div>
      </section>
    </footer>
  );
}
