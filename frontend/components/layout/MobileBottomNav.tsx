'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '../../lib/auth';
import { SearchOverlay } from '../search/SearchOverlay';

type IconProps = {
  className?: string;
};

function HomeIcon({ className = 'h-5 w-5' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.45" aria-hidden="true" className={className}>
      <path d="M4 10.5 12 4l8 6.5V20h-5.5v-6h-5v6H4V10.5Z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ShopIcon({ className = 'h-5 w-5' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.45" aria-hidden="true" className={className}>
      <path d="M6.5 8.5h11l1 11.5h-13l1-11.5Z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 8.5V6a3 3 0 0 1 6 0v2.5" strokeLinecap="round" />
    </svg>
  );
}

function SearchIcon({ className = 'h-5 w-5' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.45" aria-hidden="true" className={className}>
      <circle cx="11" cy="11" r="7" />
      <path d="m16.2 16.2 4.3 4.3" strokeLinecap="round" />
    </svg>
  );
}

function HeartIcon({ className = 'h-5 w-5' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.45" aria-hidden="true" className={className}>
      <path d="M19.2 5.1c-2-1.7-5-.9-6.4 1.2L12 7.5l-.8-1.2C9.8 4.2 6.8 3.4 4.8 5.1 2.4 7.1 2.6 10.7 5 13l7 6.7 7-6.7c2.4-2.3 2.6-5.9.2-7.9Z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function AccountIcon({ className = 'h-5 w-5' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.45" aria-hidden="true" className={className}>
      <circle cx="12" cy="7.5" r="3.5" />
      <path d="M4.8 21c1.1-4.6 3.5-6.8 7.2-6.8s6.1 2.2 7.2 6.8" strokeLinecap="round" />
    </svg>
  );
}

export function MobileBottomNav() {
  const pathname = usePathname();
  const { status, user } = useAuth();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const accountHref = status === 'authenticated' && user ? '/account' : '/login';

  const links = [
    { label: 'Home', href: '/', icon: <HomeIcon /> },
    { label: 'Shop', href: '/products', icon: <ShopIcon /> },
    { label: 'Wishlist', href: '/account/wishlist', icon: <HeartIcon /> },
    { label: 'Account', href: accountHref, icon: <AccountIcon /> },
  ];

  return (
    <>
      <nav
        aria-label="Mobile primary navigation"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-[#d8cfc2] bg-[#fbf7f0]/96 px-2 pb-[max(0.65rem,env(safe-area-inset-bottom))] pt-2.5 shadow-[0_-14px_40px_rgba(49,37,26,0.08)] backdrop-blur lg:hidden"
      >
        <div className="mx-auto grid max-w-md grid-cols-5 gap-1">
          {links.slice(0, 2).map((item) => {
            const active = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex min-h-[3.35rem] flex-col items-center justify-center gap-1 rounded-[12px] text-[0.6rem] font-semibold uppercase tracking-[0.06em] ${active ? 'bg-[#eee5da] text-[#111111]' : 'text-[#111111]'}`}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            );
          })}
          <button
            type="button"
            onClick={() => setIsSearchOpen(true)}
            className="flex min-h-[3.35rem] flex-col items-center justify-center gap-1 rounded-[12px] text-[0.6rem] font-semibold uppercase tracking-[0.06em] text-[#111111]"
          >
            <SearchIcon />
            <span>Search</span>
          </button>
          {links.slice(2).map((item) => {
            const active = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex min-h-[3.35rem] flex-col items-center justify-center gap-1 rounded-[12px] text-[0.6rem] font-semibold uppercase tracking-[0.06em] ${active ? 'bg-[#eee5da] text-[#111111]' : 'text-[#111111]'}`}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
      <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}
