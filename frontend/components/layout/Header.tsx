import Link from 'next/link';
import { AuthNav } from '../auth/AuthNav';
import { CartNavLink } from '../cart/CartNavLink';

export function Header() {
  const navigationLinks = [
    ['Home', '/'],
    ['Shop', '/products'],
    ['Collections', '/products?sort=newest'],
    ['About', '/about'],
    ['Lookbook', '/lookbook'],
  ];

  return (
    <header className="sticky top-0 z-30 border-b border-[#ddd4c8] bg-[#fbf7f0]/92 backdrop-blur">
      <div className="aevro-container grid h-16 grid-cols-[auto_1fr_auto] items-center gap-4 sm:h-20 sm:gap-8">
        <Link
          href="/"
          className="shrink-0 focus-visible:outline-none"
          aria-label="AEVRO home"
        >
          <img
            src="/images/brand/aevro-wordmark.png"
            alt="AEVRO"
            className="h-7 w-auto sm:h-8 md:h-9"
          />
        </Link>
        <nav className="hidden items-center justify-center gap-10 text-xs font-medium uppercase tracking-[0.04em] lg:flex">
          {navigationLinks.map(([label, href]) => (
            <Link key={href} href={href} className="underline-offset-8 hover:underline">
              {label}
            </Link>
          ))}
        </nav>
        <nav className="flex items-center justify-end gap-3 text-[0.7rem] font-medium uppercase tracking-[0.04em] sm:gap-5 sm:text-xs">
          <Link href="/products" className="hidden underline-offset-8 hover:underline md:inline">
            Search
          </Link>
          <AuthNav />
          <CartNavLink />
        </nav>
      </div>
      <nav className="aevro-container flex gap-5 overflow-x-auto border-t border-[#e8dfd4] py-2 text-[0.68rem] font-medium uppercase tracking-[0.06em] lg:hidden">
        {navigationLinks.map(([label, href]) => (
          <Link key={href} href={href} className="shrink-0 underline-offset-4 hover:underline">
            {label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
