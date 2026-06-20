'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';
import { useCartStore } from '../../lib/cartStore';
import { useHasHydrated } from '../../lib/useHasHydrated';

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const hydrated = useHasHydrated();
  const totalItems = useCartStore((state) => state.totalItems());
  const openDrawer = useCartStore((state) => state.openDrawer);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 bg-white transition-colors duration-300 ${
        scrolled ? 'border-b border-border' : 'border-b border-transparent'
      }`}
    >
      <div className="mx-auto flex h-14 max-w-[1400px] items-center justify-between px-6 md:h-16 md:px-8">
        {/* Left — spacer for visual balance */}
        <div className="w-20" />

        {/* Center — Logo */}
        <Link
          href="/"
          className="text-[18px] md:text-[24px]"
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 400,
            letterSpacing: '0.22em',
            color: '#111111',
            textTransform: 'uppercase' as const,
            textDecoration: 'none',
            lineHeight: 1,
          }}
        >
          AEVRO
        </Link>

        {/* Right — Nav + Cart */}
        <div className="flex w-20 items-center justify-end gap-5">
          <Link
            href="/products"
            className="hidden text-[11px] uppercase tracking-[0.15em] text-secondary transition-colors hover:text-text sm:inline"
          >
            Products
          </Link>

          <button
            onClick={openDrawer}
            aria-label="Shopping bag"
            className="relative flex h-11 w-11 items-center justify-center text-text"
          >
            <ShoppingBag size={18} strokeWidth={1.5} />
            {hydrated && totalItems > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-text text-[9px] text-white">
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
