import Link from 'next/link';
import { AuthNav } from '../auth/AuthNav';
import { CartNavLink } from '../cart/CartNavLink';

export function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-[#ddd4c8] bg-[#fbf7f0]/92 backdrop-blur">
      <div className="aevro-container grid h-20 grid-cols-[auto_1fr_auto] items-center gap-8">
        <Link
          href="/"
          className="shrink-0 focus-visible:outline-none"
          aria-label="AEVRO home"
        >
          <img
            src="/images/brand/aevro-wordmark.png"
            alt="AEVRO"
            className="h-8 w-auto md:h-9"
          />
        </Link>
        <nav className="hidden items-center justify-center gap-10 text-xs font-medium uppercase tracking-[0.04em] lg:flex">
          <Link href="/" className="underline-offset-8 hover:underline">
            Home
          </Link>
          <Link href="/products" className="underline-offset-8 hover:underline">
            Shop
          </Link>
          <Link href="/products?sort=newest" className="underline-offset-8 hover:underline">
            Collections
          </Link>
          <Link href="/about" className="underline-offset-8 hover:underline">
            About
          </Link>
          <Link href="/lookbook" className="underline-offset-8 hover:underline">
            Lookbook
          </Link>
        </nav>
        <nav className="flex items-center justify-end gap-5 text-xs font-medium uppercase tracking-[0.04em]">
          <Link href="/products" className="hidden underline-offset-8 hover:underline sm:inline">
            Search
          </Link>
          <AuthNav />
          <CartNavLink />
        </nav>
      </div>
    </header>
  );
}
