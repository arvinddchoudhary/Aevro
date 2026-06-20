import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-dark px-6 pb-8 pt-16 lg:px-12">
      <div className="mx-auto mb-12 grid max-w-[1200px] grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-12">
        {/* Column 1 — Brand */}
        <div>
          <h2
            className="mb-4 text-xl uppercase tracking-[0.2em] text-white"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            AEVRO
          </h2>
          <p className="max-w-[220px] text-[12px] leading-relaxed text-[#666]">
            Premium wide-leg trousers. Minimal. Modern. Made to last.
          </p>
        </div>

        {/* Column 2 — Shop */}
        <div>
          <h3 className="mb-4 text-[10px] uppercase tracking-[0.25em] text-[#555]">
            Shop
          </h3>
          <nav className="flex flex-col gap-2.5">
            <Link
              href="/products"
              className="block text-[13px] text-[#888] transition-colors hover:text-white"
            >
              All Products
            </Link>
            <Link
              href="/products"
              className="block text-[13px] text-[#888] transition-colors hover:text-white"
            >
              New Arrivals
            </Link>
          </nav>
        </div>

        {/* Column 3 — Info */}
        <div>
          <h3 className="mb-4 text-[10px] uppercase tracking-[0.25em] text-[#555]">
            Info
          </h3>
          <nav className="flex flex-col gap-2.5">
            <Link
              href="#"
              className="block text-[13px] text-[#888] transition-colors hover:text-white"
            >
              About
            </Link>
            <Link
              href="#"
              className="block text-[13px] text-[#888] transition-colors hover:text-white"
            >
              Shipping & Returns
            </Link>
            <Link
              href="#"
              className="block text-[13px] text-[#888] transition-colors hover:text-white"
            >
              FAQ
            </Link>
            <Link
              href="#"
              className="block text-[13px] text-[#888] transition-colors hover:text-white"
            >
              Contact
            </Link>
          </nav>
        </div>

        {/* Column 4 — Legal */}
        <div>
          <h3 className="mb-4 text-[10px] uppercase tracking-[0.25em] text-[#555]">
            Legal
          </h3>
          <nav className="flex flex-col gap-2.5">
            <Link
              href="#"
              className="block text-[13px] text-[#888] transition-colors hover:text-white"
            >
              Privacy Policy
            </Link>
            <Link
              href="#"
              className="block text-[13px] text-[#888] transition-colors hover:text-white"
            >
              Terms of Service
            </Link>
            <Link
              href="#"
              className="block text-[13px] text-[#888] transition-colors hover:text-white"
            >
              Refund Policy
            </Link>
          </nav>
        </div>
      </div>

      {/* Bottom row */}
      <div className="mx-auto flex max-w-[1200px] flex-col items-center justify-between gap-4 border-t border-[#1f1f1f] pt-6 sm:flex-row">
        <p className="text-[11px] text-[#444]">
          © 2026 AEVRO. All rights reserved.
        </p>
        <div className="flex gap-5">
          <Link
            href="#"
            className="text-[11px] uppercase tracking-wide text-[#555] transition-colors hover:text-[#888]"
          >
            Instagram
          </Link>
          <Link
            href="#"
            className="text-[11px] uppercase tracking-wide text-[#555] transition-colors hover:text-[#888]"
          >
            WhatsApp
          </Link>
        </div>
      </div>
    </footer>
  );
}
