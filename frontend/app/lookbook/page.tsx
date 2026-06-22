import Link from 'next/link';

const looks = [
  ['01.', 'Refined ease', 'Soft tones. Clean lines. Effortless every day.'],
  ['02.', 'Modern work', 'Tailored for focus. Designed to perform.'],
  ['03.', 'Weekend mindset', 'Relaxed yet refined. Comfort in balance.'],
  ['04.', 'Neutral harmony', 'Understated layers. Timeless combination.'],
  ['05.', 'City essential', 'Sharp silhouette. Built for the city.'],
];

export default function LookbookPage() {
  return (
    <main>
      <section className="border-b border-[#ddd4c8]">
        <div className="relative min-h-[470px] overflow-hidden">
          <img
            src="/images/brand/atelier-rack.webp"
            alt="AEVRO lookbook studio"
            className="absolute inset-0 h-full w-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(251,247,240,0.97)_0%,rgba(251,247,240,0.88)_32%,rgba(251,247,240,0.24)_62%,rgba(251,247,240,0)_100%)]" />
          <div className="relative flex min-h-[470px] items-center px-6 py-16 sm:px-12 lg:px-20 xl:px-28">
            <div>
            <h1 className="text-5xl font-light uppercase leading-none md:text-7xl">
              Lookbook
            </h1>
            <p className="mt-7 text-xs font-medium uppercase tracking-[0.12em]">
              Timeless pieces. Modern moments.
            </p>
            <p className="mt-6 max-w-sm text-sm leading-7 text-[#514c45]">
              A curated edit of versatile looks designed for every part of your
              day.
            </p>
          </div>
          </div>
        </div>
      </section>

      <section className="aevro-container py-12">
        <div className="mb-8 flex justify-center gap-12 text-xs font-medium uppercase tracking-[0.08em]">
          <span className="border-b border-[#111111] pb-2">All looks</span>
          <span>Day to day</span>
          <span>Workwear</span>
          <span>Weekend</span>
        </div>
        <img
          src="/images/brand/lookbook-grid.webp"
          alt="AEVRO lookbook outfits"
          className="w-full border border-[#ddd4c8] object-cover"
        />
        <div className="mt-6 grid gap-3 md:grid-cols-5">
          {looks.map(([number, title, copy]) => (
            <article key={number} className="border border-[#ddd4c8] bg-[#fffaf3] p-4">
              <p className="text-xs text-[#514c45]">{number}</p>
              <p className="mt-2 text-xs font-medium uppercase tracking-[0.08em]">
                {title}
              </p>
              <p className="mt-2 text-xs leading-5 text-[#514c45]">{copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="relative min-h-[330px] overflow-hidden border-y border-[#ddd4c8]">
        <img
          src="/images/brand/fabric-detail.webp"
          alt="AEVRO fabric detail"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(251,247,240,0.1)_0%,rgba(251,247,240,0.44)_42%,rgba(251,247,240,0.96)_70%,rgba(251,247,240,0.98)_100%)]" />
        <div className="relative flex min-h-[330px] items-center justify-end px-6 py-12 sm:px-12 lg:px-20 xl:px-28">
        <div className="max-w-lg">
          <h2 className="text-3xl font-light uppercase">Style that lasts.</h2>
          <p className="mt-5 max-w-md text-sm leading-7 text-[#514c45]">
            True style is not about trends. It is about pieces that stand the
            test of time and move with the moments that matter.
          </p>
          <Link
            href="/products"
            className="mt-7 inline-flex text-xs font-medium uppercase tracking-[0.08em] underline-offset-8 hover:underline"
          >
            Explore the collection →
          </Link>
        </div>
        </div>
      </section>
    </main>
  );
}
