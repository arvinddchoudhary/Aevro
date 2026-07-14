import Link from 'next/link';

type AccountHeroProps = {
  title?: string;
  breadcrumb?: Array<{
    label: string;
    href?: string;
  }>;
};

export function AccountHero({
  title = 'My Profile',
  breadcrumb = [
    { label: 'Home', href: '/' },
    { label: 'Account' },
  ],
}: AccountHeroProps) {
  return (
    <section className="relative isolate h-[132px] overflow-hidden border-b border-[#ddd4c8] bg-[#efe3d4] sm:h-auto">
      <div
        className="absolute inset-0 -z-10 bg-cover bg-[72%_center] sm:bg-center"
        style={{ backgroundImage: "url('/images/brand/atelier-band.webp')" }}
        aria-hidden="true"
      />
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(251,247,240,0.98)_0%,rgba(251,247,240,0.9)_42%,rgba(251,247,240,0.28)_76%,rgba(251,247,240,0.12)_100%)]" />
      <div className="aevro-container flex h-full items-center py-5 sm:min-h-[210px] sm:py-10 lg:min-h-[250px]">
        <div className="min-w-0">
          <h1 className="max-w-[270px] break-words font-serif text-[1.72rem] font-light uppercase leading-[1.02] tracking-[0.08em] text-[#111111] sm:max-w-none sm:text-5xl sm:tracking-[0.12em] lg:text-6xl">
            {title}
          </h1>
          <nav
            aria-label="Breadcrumb"
            className="mt-3 flex max-w-[280px] flex-wrap items-center gap-2 text-[0.72rem] text-[#6b6258] sm:mt-5 sm:max-w-none sm:gap-4 sm:text-sm"
          >
            {breadcrumb.map((item, index) => (
              <span key={`${item.label}-${index}`} className="flex items-center gap-2 sm:gap-4">
                {index > 0 && <span aria-hidden="true">/</span>}
                {item.href ? (
                  <Link
                    href={item.href}
                    className="underline-offset-4 hover:text-[#111111] hover:underline"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span>{item.label}</span>
                )}
              </span>
            ))}
          </nav>
        </div>
      </div>
    </section>
  );
}
