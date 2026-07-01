import Link from 'next/link';

export function AccountHero() {
  return (
    <section className="relative isolate overflow-hidden border-b border-[#ddd4c8] bg-[#efe3d4]">
      <div
        className="absolute inset-0 -z-10 bg-cover bg-[70%_center] sm:bg-center"
        style={{ backgroundImage: "url('/images/brand/atelier-band.webp')" }}
        aria-hidden="true"
      />
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(251,247,240,0.96)_0%,rgba(251,247,240,0.82)_34%,rgba(251,247,240,0.34)_72%,rgba(251,247,240,0.2)_100%)]" />
      <div className="aevro-container flex min-h-[190px] items-center py-10 sm:min-h-[230px] lg:min-h-[250px]">
        <div>
          <h1 className="font-serif text-4xl font-light uppercase tracking-[0.12em] text-[#111111] sm:text-5xl lg:text-6xl">
            My Profile
          </h1>
          <nav
            aria-label="Breadcrumb"
            className="mt-5 flex items-center gap-4 text-sm text-[#6b6258]"
          >
            <Link href="/" className="underline-offset-4 hover:text-[#111111] hover:underline">
              Home
            </Link>
            <span aria-hidden="true">/</span>
            <span>Account</span>
          </nav>
        </div>
      </div>
    </section>
  );
}
