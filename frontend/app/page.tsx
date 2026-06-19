export default function HomePage() {
  return (
    <main className="min-h-screen bg-white text-[#111111]">
      <header className="flex h-16 items-center justify-between border-b border-[#e5e5e5] px-6">
        <span className="text-xl tracking-[0.24em]">AEVRO</span>
        <span className="text-xs uppercase tracking-[0.2em] text-[#666666]">
          Phase 1
        </span>
      </header>

      <section className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-5xl flex-col justify-center px-6 py-20">
        <p className="mb-4 text-xs uppercase tracking-[0.28em] text-[#666666]">
          Production stack foundation
        </p>
        <h1 className="max-w-3xl text-5xl font-light leading-tight md:text-7xl">
          Premium clothing commerce, built cleanly.
        </h1>
        <p className="mt-8 max-w-xl text-base leading-7 text-[#555555]">
          AEVRO is moving to Next.js, NestJS, Prisma, Neon, Cloudinary, and
          Razorpay with a modular production architecture.
        </p>
      </section>
    </main>
  );
}
