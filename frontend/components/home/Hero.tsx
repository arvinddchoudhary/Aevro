'use client';

import Link from 'next/link';
import { ArrowRight, ChevronDown } from 'lucide-react';

const brandStripItems = [
  'Free Shipping Above ₹999',
  'Premium Fabric',
  'Easy Returns',
  'Secure Checkout',
];

export function Hero() {
  return (
    <>
      {/* ── Full-width Hero ── */}
      <section className="relative h-[70vh] w-full overflow-hidden bg-muted md:h-screen">
        {/* Placeholder background */}
        <div className="absolute inset-0 bg-[#d4cfc6]">
          <div className="flex h-full w-full items-center justify-center">
            <span className="text-[10px] uppercase tracking-[0.3em] text-[#999]">
              Campaign Image — 1920×1080
            </span>
          </div>
        </div>

        {/* Gradient overlay */}
        <div
          className="absolute inset-0 z-10"
          style={{
            background:
              'linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.35) 100%)',
          }}
        />

        {/* Content overlay */}
        <div className="absolute bottom-0 left-0 right-0 z-20 flex flex-col gap-8 px-6 pb-10 md:flex-row md:items-end md:justify-between md:px-12 md:pb-16">
          {/* Left side */}
          <div>
            <p className="mb-3 text-[10px] uppercase tracking-[0.35em] text-white/70">
              Premium Trousers. Minimal Form.
            </p>
            <h1 className="font-display text-[42px] font-light leading-[1.05] text-white md:text-[64px]">
              Wide-leg essentials
              <br />
              for a cleaner
              <br />
              everyday uniform.
            </h1>
            <p className="mt-4 max-w-[420px] text-[13px] leading-relaxed text-white/70">
              AEVRO builds quiet, premium clothing around proportion, fabric,
              and repeat wear. Start with the first trouser range.
            </p>
            <Link
              href="/products"
              className="mt-6 inline-flex items-center gap-3 bg-white px-7 py-3.5 text-[11px] uppercase tracking-[0.2em] text-text transition-colors duration-300 hover:bg-text hover:text-white"
              style={{ border: 'none', textDecoration: 'none' }}
            >
              Shop the range
              <ArrowRight size={14} />
            </Link>
          </div>

          {/* Right side — stats (desktop only) */}
          <div className="hidden flex-col items-end gap-6 text-right text-white md:flex">
            <div>
              <p className="font-display text-3xl font-light md:text-4xl">3</p>
              <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-white/60">
                Colourways
              </p>
            </div>
            <div>
              <p className="font-display text-3xl font-light md:text-4xl">
                28–34
              </p>
              <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-white/60">
                Size range
              </p>
            </div>
            <div>
              <p className="font-display text-3xl font-light md:text-4xl">
                100%
              </p>
              <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-white/60">
                Direct to you
              </p>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-6 left-1/2 z-20 -translate-x-1/2 animate-bounce">
          <ChevronDown size={18} className="text-white/50" />
        </div>
      </section>

      {/* ── Brand Strip ── */}
      <div className="flex flex-wrap items-center justify-center gap-4 border-b border-border px-6 py-4 md:gap-8 md:px-8">
        {brandStripItems.map((item, i) => (
          <div
            key={item}
            className={`flex items-center gap-4 md:gap-8 ${
              i === 0 || i === brandStripItems.length - 1
                ? 'hidden sm:flex'
                : 'flex'
            }`}
          >
            {i > 0 && <span className="text-[#ddd]">·</span>}
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#999]">
              {item}
            </span>
          </div>
        ))}
      </div>
    </>
  );
}
