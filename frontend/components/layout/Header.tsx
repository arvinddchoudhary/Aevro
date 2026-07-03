'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { useAuth } from '../../lib/auth';
import { useCart } from '../../lib/cart';
import { SearchOverlay } from '../search/SearchOverlay';

const navigationLinks = [
  ['HOME', '/'],
  ['SHOP', '/products'],
  ['ABOUT', '/about'],
  ['LOOKBOOK', '/lookbook'],
] as const;

type IconProps = {
  className?: string;
};

function SearchIcon({ className = 'h-6 w-6' }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.35"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m16.2 16.2 4.3 4.3" />
    </svg>
  );
}

function AccountIcon({ className = 'h-6 w-6' }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.35"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <circle cx="12" cy="7.5" r="3.5" />
      <path d="M4.8 21c1.1-4.6 3.5-6.8 7.2-6.8s6.1 2.2 7.2 6.8" />
    </svg>
  );
}

function HeartIcon({ className = 'h-6 w-6' }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.35"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M19.2 5.1c-2-1.7-5-.9-6.4 1.2L12 7.5l-.8-1.2C9.8 4.2 6.8 3.4 4.8 5.1 2.4 7.1 2.6 10.7 5 13l7 6.7 7-6.7c2.4-2.3 2.6-5.9.2-7.9Z" />
    </svg>
  );
}

function BagIcon({ className = 'h-6 w-6' }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.35"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M6.5 8.5h11l1 12h-13l1-12Z" />
      <path d="M9 8.5V6a3 3 0 0 1 6 0v2.5" />
    </svg>
  );
}

function MenuIcon({ className = 'h-6 w-6' }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.35"
      strokeLinecap="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M4 7h16" />
      <path d="M4 12h16" />
      <path d="M4 17h16" />
    </svg>
  );
}

function CloseIcon({ className = 'h-6 w-6' }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.35"
      strokeLinecap="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M6 6l12 12" />
      <path d="M18 6 6 18" />
    </svg>
  );
}

function CountBadge({ count, label }: { count: number; label: string }) {
  if (count <= 0) {
    return null;
  }

  return (
    <span
      className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#e5ded4] px-1.5 text-[0.68rem] font-semibold leading-none text-[#111111]"
      aria-label={label}
    >
      {count}
    </span>
  );
}

function DesktopAction({
  href,
  label,
  icon,
  boxed = false,
  count,
}: {
  href: string;
  label: string;
  icon: ReactNode;
  boxed?: boolean;
  count?: number;
}) {
  return (
    <Link
      href={href}
      className={`relative inline-flex min-h-12 cursor-pointer items-center justify-center gap-2.5 px-3 text-[0.66rem] font-semibold uppercase tracking-[0.18em] text-[#111111] transition hover:bg-[#efe8df]/70 ${
        boxed
          ? 'rounded-[6px] border border-[#cfc4b6] bg-[#fbf7f0]/62 px-4 shadow-[0_8px_24px_rgba(49,37,26,0.03)]'
          : ''
      }`}
      aria-label={label}
    >
      <span className="text-[#111111]">{icon}</span>
      <span>{label}</span>
      {typeof count === 'number' ? <CountBadge count={count} label={`${label} count ${count}`} /> : null}
    </Link>
  );
}

function DesktopActionButton({
  label,
  icon,
  onClick,
}: {
  label: string;
  icon: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="relative inline-flex min-h-12 cursor-pointer items-center justify-center gap-2.5 px-3 text-[0.66rem] font-semibold uppercase tracking-[0.18em] text-[#111111] transition hover:bg-[#efe8df]/70"
      aria-label={label}
    >
      <span className="text-[#111111]">{icon}</span>
      <span>{label}</span>
    </button>
  );
}

export function Header() {
  const router = useRouter();
  const { itemCount } = useCart();
  const { logout, status, user } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const accountHref = status === 'authenticated' && user ? '/account' : '/login';

  const closeMenu = () => setIsMenuOpen(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logout();
    setIsLoggingOut(false);
    closeMenu();
    router.push('/');
    router.refresh();
  };

  const mobileLinks = [
    ...navigationLinks,
    ['ACCOUNT', accountHref],
    ['WISHLIST', '/account/wishlist'],
    ['BAG', '/cart'],
  ] as const;

  return (
    <>
    <header className="sticky top-0 z-30 border-b border-[#ddd4c8] bg-[#fbf7f0]/96 text-[#111111] backdrop-blur">
      <div className="mx-auto grid h-[66px] w-full max-w-[1920px] grid-cols-[auto_1fr_auto] items-center gap-3 px-5 sm:h-[74px] sm:px-8 lg:h-[82px] lg:grid-cols-[minmax(210px,0.8fr)_minmax(380px,1fr)_minmax(390px,0.9fr)] lg:px-10 xl:px-16">
        <Link
          href="/"
          className="inline-flex shrink-0 cursor-pointer focus-visible:outline-none"
          aria-label="AEVRO home"
          onClick={closeMenu}
        >
          <img
            src="/images/brand/aevro-wordmark.png"
            alt="AEVRO"
            className="h-8 w-auto sm:h-9 lg:h-[42px]"
          />
        </Link>

        <nav className="hidden items-center justify-center gap-8 text-[0.72rem] font-semibold uppercase tracking-[0.22em] lg:flex xl:gap-11">
          {navigationLinks.map(([label, href]) => (
            <Link
              key={href}
              href={href}
              className="cursor-pointer underline-offset-8 transition hover:text-[#6f6254] hover:underline"
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center justify-end gap-2 lg:flex">
          <DesktopActionButton
            label="SEARCH"
            icon={<SearchIcon />}
            onClick={() => setIsSearchOpen(true)}
          />
          <span className="h-9 w-px bg-[#d8cfc2]" aria-hidden="true" />
          <DesktopAction href={accountHref} label="ACCOUNT" icon={<AccountIcon />} />
          <DesktopAction
            href="/account/wishlist"
            label="WISHLIST"
            icon={<HeartIcon />}
            boxed
          />
          <DesktopAction href="/cart" label="BAG" icon={<BagIcon />} count={itemCount} />
        </div>

        <div className="flex items-center justify-end gap-2 lg:hidden">
          <Link
            href="/cart"
            className="relative inline-flex h-10 w-10 cursor-pointer items-center justify-center border border-[#ddd4c8] bg-[#fffaf3]/70"
            aria-label={`Bag with ${itemCount} item${itemCount === 1 ? '' : 's'}`}
            onClick={closeMenu}
          >
            <BagIcon className="h-5 w-5" />
            <CountBadge count={itemCount} label={`Bag count ${itemCount}`} />
          </Link>
          <button
            type="button"
            className="inline-flex h-10 w-10 cursor-pointer items-center justify-center border border-[#ddd4c8] bg-[#fffaf3]/70"
            aria-label="Search products"
            onClick={() => {
              closeMenu();
              setIsSearchOpen(true);
            }}
          >
            <SearchIcon className="h-5 w-5" />
          </button>
          <button
            type="button"
            className="inline-flex h-10 w-10 cursor-pointer items-center justify-center border border-[#ddd4c8] bg-[#fffaf3]/70"
            aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={isMenuOpen}
            onClick={() => setIsMenuOpen((current) => !current)}
          >
            {isMenuOpen ? <CloseIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {isMenuOpen ? (
        <div className="border-t border-[#ddd4c8] bg-[#fbf7f0] px-5 py-4 shadow-[0_18px_40px_rgba(49,37,26,0.08)] lg:hidden">
          <nav className="grid gap-2 text-xs font-semibold uppercase tracking-[0.22em]">
            <button
              type="button"
              onClick={() => {
                closeMenu();
                setIsSearchOpen(true);
              }}
              className="flex min-h-12 cursor-pointer items-center justify-between border-b border-[#e6ddd1] py-3 text-left"
            >
              <span>SEARCH</span>
              <span aria-hidden="true">→</span>
            </button>
            {mobileLinks.map(([label, href]) => (
              <Link
                key={`${label}-${href}`}
                href={href}
                className="flex min-h-12 cursor-pointer items-center justify-between border-b border-[#e6ddd1] py-3"
                onClick={closeMenu}
              >
                <span>{label}</span>
                {label === 'BAG' && itemCount > 0 ? (
                  <span className="rounded-full bg-[#e5ded4] px-2 py-1 text-[0.68rem] tracking-normal">
                    {itemCount}
                  </span>
                ) : (
                  <span aria-hidden="true">→</span>
                )}
              </Link>
            ))}
            {status === 'authenticated' && user ? (
              <button
                type="button"
                disabled={isLoggingOut}
                onClick={handleLogout}
                className="flex min-h-12 cursor-pointer items-center justify-between py-3 text-left uppercase tracking-[0.22em] disabled:cursor-not-allowed disabled:text-[#8b8176]"
              >
                <span>{isLoggingOut ? 'LOGGING OUT' : 'LOGOUT'}</span>
                <span aria-hidden="true">→</span>
              </button>
            ) : null}
          </nav>
        </div>
      ) : null}
    </header>
    <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}
