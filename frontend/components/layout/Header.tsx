import Link from 'next/link';

export function Header() {
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-[#e5e5e5] bg-white/95 px-5 backdrop-blur sm:px-8">
      <Link href="/" className="text-xl tracking-[0.24em]">
        AEVRO
      </Link>
      <nav className="flex items-center gap-6 text-sm">
        <Link href="/products" className="underline-offset-4 hover:underline">
          Products
        </Link>
      </nav>
    </header>
  );
}
