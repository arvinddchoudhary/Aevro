export default function AboutPage() {
  return (
    <main>
      <section className="border-b border-[#ddd4c8]">
        <div className="relative h-[430px] overflow-hidden sm:h-[500px] lg:h-auto lg:aspect-[2029/775]">
          <img
            src="/images/brand/About-Top-Image.webp"
            alt="AEVRO studio tailoring scene"
            className="absolute inset-0 h-full w-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(251,247,240,0.98)_0%,rgba(251,247,240,0.88)_32%,rgba(251,247,240,0.28)_64%,rgba(251,247,240,0)_100%)]" />
          <div className="relative flex h-full items-center px-6 py-16 sm:px-12 lg:px-20 xl:px-28">
            <div>
            <p className="text-xs font-medium uppercase tracking-[0.12em]">
              Our story
            </p>
            <h1 className="mt-6 max-w-3xl text-5xl font-light uppercase leading-[1.02] md:text-6xl">
              Built on simplicity. Driven by purpose.
            </h1>
            <p className="mt-7 max-w-xl text-sm leading-7 text-[#514c45]">
              AEVRO was created with a simple belief: the best wardrobe starts
              with the essentials. We design timeless pieces that combine modern
              tailoring, premium fabrics, and thoughtful details.
            </p>
          </div>
          </div>
        </div>
      </section>

      <section className="aevro-container py-14 text-center">
        <p className="text-xs font-medium uppercase tracking-[0.12em]">
          Our values
        </p>
        <div className="mt-9 grid gap-8 md:grid-cols-4">
          {[
            ['Timeless design', 'Modern essentials with a refined aesthetic that stand the test of time.'],
            ['Quality first', 'Premium fabrics and meticulous construction for comfort you can feel.'],
            ['Responsible made', 'Trusted partners and thoughtful production choices.'],
            ['Built to last', 'Durable materials made to wear, day after day.'],
          ].map(([title, copy]) => (
            <article key={title} className="border-r border-[#ddd4c8] px-6 last:border-r-0">
              <p className="text-sm font-medium uppercase tracking-[0.08em]">{title}</p>
              <p className="mt-4 text-sm leading-7 text-[#514c45]">{copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="grid border-y border-[#ddd4c8] lg:grid-cols-2">
        <div className="relative h-[380px] overflow-hidden bg-[#eee8de] lg:h-[460px]">
          <img
            src="/images/brand/fabric-detail.webp"
            alt="AEVRO fabric detail"
            className="h-full w-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(251,247,240,0.95)_0%,rgba(251,247,240,0.82)_40%,rgba(251,247,240,0.28)_100%)]" />
          <div className="absolute inset-0 flex items-center px-6 py-14 sm:px-12 lg:px-20">
            <div className="max-w-lg">
              <p className="text-xs font-medium uppercase tracking-[0.12em]">
                Crafted with intention
              </p>
              <h2 className="mt-5 text-3xl font-light uppercase leading-tight">
                The details make the difference.
              </h2>
              <p className="mt-5 text-sm leading-7 text-[#514c45]">
                From fabric drape to tailoring precision, every element is carefully
                considered.
              </p>
            </div>
          </div>
        </div>
        <div className="relative min-h-[380px] overflow-hidden lg:min-h-[460px]">
          <img
            src="/images/brand/product-detail-black.webp"
            alt="AEVRO trouser detail"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(251,247,240,0.18)_0%,rgba(251,247,240,0.72)_58%,rgba(251,247,240,0.96)_100%)]" />
          <div className="relative flex min-h-[380px] items-center justify-end px-6 py-12 sm:px-12 lg:min-h-[460px] lg:px-20">
            <div className="max-w-md">
              <p className="text-xs font-medium uppercase tracking-[0.12em]">
                Sustainability
              </p>
              <h2 className="mt-5 text-3xl font-light uppercase leading-tight">
                Better for people. Better for tomorrow.
              </h2>
              <p className="mt-5 text-sm leading-7 text-[#514c45]">
                We choose responsible materials, reduce waste, and build lasting
                pieces that encourage mindful consumption.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
