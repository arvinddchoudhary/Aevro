'use client';

import { useState } from 'react';
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
    links: [{ label: 'Trousers', href: '/products' }],
  },
  {
    title: 'Collections',
    links: [
      { label: 'Signature Pleats', href: '/collections/signature-pleats' },
      { label: 'Core Collection', href: '/collections/core-collection' },
    ],
  },
  {
    title: 'About',
    links: [
      { label: 'Our Story', href: '/about/our-story' },
      { label: 'Philosophy', href: '/about/philosophy' },
      { label: 'Craftsmanship', href: '/about/craftsmanship' },
      { label: 'Sustainability', href: '/about/sustainability' },
    ],
  },
  {
    title: 'Help',
    links: [
      { label: 'Size Guide', href: '/help/size-guide' },
      { label: 'Orders & Shipping', href: '/help/shipping' },
      { label: 'Returns & Exchanges', href: '/help/returns' },
      { label: 'Contact Us', href: '/help/contact' },
      { label: 'FAQs', href: '/help/faq' },
    ],
  },
];

export function ServiceBenefitsPanel({ className = '' }: { className?: string }) {
  return (
    <div
      className={`grid overflow-hidden rounded-[18px] border border-[#eadfd2] bg-[#fffaf3]/80 shadow-[0_24px_80px_rgba(49,37,26,0.05)] sm:grid-cols-2 lg:grid-cols-4 ${className}`}
    >
      {serviceItems.map((item, index) => {
        const mobileBorder = index < serviceItems.length - 1 ? 'border-b border-[#eadfd2]' : '';
        const tabletBorder = index % 2 === 0 ? 'sm:border-r' : 'sm:border-r-0';
        const tabletBottom = index < 2 ? 'sm:border-b' : 'sm:border-b-0';
        const desktopBorder = index < serviceItems.length - 1 ? 'lg:border-r' : 'lg:border-r-0';

        return (
          <article
            key={item.title}
            className={`flex min-h-[150px] flex-col items-center justify-center px-6 py-7 text-center sm:min-h-[165px] lg:min-h-[180px] lg:border-b-0 ${mobileBorder} ${tabletBorder} ${tabletBottom} ${desktopBorder}`}
          >
            <div className="text-[#9b8970]">{item.icon}</div>
            <h3 className="mt-5 font-serif text-base uppercase tracking-[0.32em] text-[#211d18] sm:text-lg">
              {item.title}
            </h3>
            <span className="mt-4 h-px w-10 bg-[#d6c0a5]" aria-hidden="true" />
            <p className="mt-4 text-sm leading-6 text-[#62574c] sm:text-base">{item.detail}</p>
          </article>
        );
      })}
    </div>
  );
}

export function ServiceBenefitsStrip({ className = '' }: { className?: string }) {
  return (
    <section className={`px-4 py-8 sm:px-6 sm:py-10 lg:px-10 lg:py-12 ${className}`}>
      <ServiceBenefitsPanel className="mx-auto max-w-[1820px]" />
    </section>
  );
}

function CompactServiceStrip() {
  return (
    <section className="border-y border-[#ddd4c8] bg-[#fffaf2] px-4 py-4">
      <div className="mx-auto grid max-w-7xl gap-4 rounded-lg border border-[#ddd4c8] px-5 py-4 sm:grid-cols-2 lg:grid-cols-4">
        {compactServiceItems.map((item) => (
          <article
            key={item.title}
            className="flex items-center gap-4 border-[#ddd4c8] py-1 lg:border-r lg:pr-8 lg:last:border-r-0"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center border border-[#111111] text-[10px] uppercase tracking-[0.18em] text-[#111111]">
              {item.code}
            </span>
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-[#111111]">
                {item.title}
              </h3>
              <p className="mt-1 text-xs text-[#5f574f]">{item.detail}</p>
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

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !EMAIL_REGEX.test(email.trim())) {
      setStatus('error');
      return;
    }
    setStatus('success');
    setEmail('');
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="mt-6">
      <div className="flex border-b border-[#111111]">
        <input
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (status !== 'idle') setStatus('idle');
          }}
          placeholder="Email address"
          className="h-11 flex-1 bg-transparent text-sm outline-none"
          aria-label="Email address"
        />
        <button type="submit" className="px-2 text-xl" aria-label="Submit email">
          →
        </button>
      </div>
      {status === 'success' && (
        <p className="mt-3 text-sm text-[#3f6d3f]">Thanks — you&apos;re on the list.</p>
      )}
      {status === 'error' && (
        <p className="mt-3 text-sm text-[#9b3b3b]">Please enter a valid email address.</p>
      )}
    </form>
  );
}

export function Footer() {
  const pathname = usePathname();

  return (
    <footer className="border-t border-[#ddd4c8] bg-[#fbf7f0]">
      {shouldShowFooterServiceStrip(pathname) && <BenefitStrip />}

      <section className="border-t border-[#ddd4c8] bg-[#f3eadf]/55">
        <div className="aevro-container grid gap-10 py-9 lg:grid-cols-[1.1fr_2fr_1fr]">
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
          <div className="mt-6 flex gap-4">
            <a href="https://instagram.com/aevro" target="_blank" rel="noopener noreferrer" aria-label="AEVRO on Instagram" className="text-[#514c45] transition-colors hover:text-[#111111]">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
                <rect x="2" y="2" width="20" height="20" rx="5" />
                <circle cx="12" cy="12" r="5" />
                <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
              </svg>
            </a>
            <a href="https://facebook.com/aevro" target="_blank" rel="noopener noreferrer" aria-label="AEVRO on Facebook" className="text-[#514c45] transition-colors hover:text-[#111111]">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3V2Z" />
              </svg>
            </a>
            <a href="https://pinterest.com/aevro" target="_blank" rel="noopener noreferrer" aria-label="AEVRO on Pinterest" className="text-[#514c45] transition-colors hover:text-[#111111]">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
                <path d="M12 2a10 10 0 0 0-3.16 19.5c-.07-.63-.13-1.6.03-2.29l1.15-4.88s-.29-.58-.29-1.44c0-1.35.78-2.36 1.76-2.36.83 0 1.23.62 1.23 1.37 0 .84-.53 2.09-.81 3.25-.23.97.49 1.76 1.45 1.76 1.74 0 3.07-1.83 3.07-4.48 0-2.34-1.68-3.98-4.09-3.98-2.79 0-4.42 2.09-4.42 4.25 0 .84.32 1.74.73 2.23a.29.29 0 0 1 .07.28l-.27 1.11c-.04.18-.15.22-.34.13-1.26-.59-2.05-2.42-2.05-3.9 0-3.18 2.31-6.1 6.66-6.1 3.5 0 6.22 2.49 6.22 5.82 0 3.47-2.19 6.27-5.23 6.27-1.02 0-1.98-.53-2.31-1.16l-.63 2.4c-.23.88-.85 1.99-1.26 2.66A10 10 0 1 0 12 2Z" />
              </svg>
            </a>
          </div>
        </div>

        <div className="grid gap-8 sm:grid-cols-4">
          {footerGroups.map((group) => (
            <div key={group.title}>
              <p className="text-xs font-medium uppercase tracking-[0.08em]">
                {group.title}
              </p>
              <div className="mt-4 space-y-2 text-sm text-[#514c45]">
                {group.links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="block underline-offset-4 hover:underline"
                  >
                    {link.label}
                  </Link>
                ))}
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
          <NewsletterForm />
        </div>
        </div>
      </section>

      <section className="border-t border-[#ddd4c8]">
        <div className="aevro-container flex flex-col gap-3 py-6 text-xs text-[#514c45] sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 AEVRO. All rights reserved.</p>
          <div className="flex flex-wrap gap-x-8 gap-y-2">
            <Link href="/legal/privacy" className="underline-offset-4 hover:underline">Privacy Policy</Link>
            <Link href="/legal/shipping-policy" className="underline-offset-4 hover:underline">Shipping Policy</Link>
            <Link href="/legal/returns-policy" className="underline-offset-4 hover:underline">Return Policy</Link>
            <Link href="/legal/terms" className="underline-offset-4 hover:underline">Terms &amp; Conditions</Link>
          </div>
        </div>
      </section>
    </footer>
  );
}
