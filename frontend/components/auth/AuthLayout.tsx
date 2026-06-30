import Link from 'next/link';
import type { ReactNode } from 'react';

type AuthLayoutProps = {
  children: ReactNode;
  sideImagePath?: string;
  variant?: 'split' | 'background';
};

export function AuthLayout({
  children,
  sideImagePath = '/images/brand/hero-trousers.webp',
  variant = 'split',
}: AuthLayoutProps) {
  if (variant === 'background') {
    return (
      <main className="relative min-h-screen overflow-hidden bg-[#f7f1e8] text-[#111111]">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('${sideImagePath}')`,
          }}
        />
        <div className="absolute inset-0 bg-[rgba(17,13,9,0.12)]" />
        <section className="relative z-10 flex min-h-screen items-center justify-center px-4 py-4 sm:px-8 sm:py-6 lg:px-12">
          <div className="w-full max-w-[34rem] border border-[#d8d0c6] bg-[#fbf7f0]/92 p-5 shadow-[0_24px_90px_rgba(17,13,9,0.16)] backdrop-blur-[2px] sm:p-6">
            {children}
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f1e8] text-[#111111] lg:grid lg:grid-cols-2">
      <AuthSidePanel imagePath={sideImagePath} />
      <section className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-10 lg:px-12 xl:px-16">
        {children}
      </section>
    </main>
  );
}

function AuthSidePanel({ imagePath }: { imagePath: string }) {
  return (
    <aside className="relative hidden min-h-screen overflow-hidden bg-[#211b16] lg:block">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('${imagePath}')`,
        }}
      />
      <div className="absolute inset-0 bg-[rgba(17,13,9,0.38)]" />
      <div className="relative z-10 flex min-h-screen flex-col justify-between p-10 xl:p-14">
        <Link href="/" className="w-fit">
          <p className="font-serif text-5xl tracking-[0.18em] text-[#fffaf3]">
            AEVRO
          </p>
          <p className="mt-3 text-[0.65rem] font-semibold uppercase tracking-[0.46em] text-[#f7f1e8]">
            Crafted for distinction
          </p>
        </Link>

        <div className="max-w-xl pb-12">
          <h2 className="font-serif text-5xl uppercase leading-[1.15] tracking-[0.1em] text-[#fffaf3] xl:text-6xl">
            Timeless style.
            <br />
            Modern elegance.
          </h2>
          <div className="mt-8 h-px w-40 bg-[#b89464]" />
          <p className="mt-8 text-sm font-medium uppercase tracking-[0.32em] text-[#f7f1e8]">
            Clothing that defines you.
          </p>
        </div>
      </div>
    </aside>
  );
}
