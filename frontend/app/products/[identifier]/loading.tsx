export default function ProductDetailsLoading() {
  return (
    <main className="mx-auto grid min-h-screen max-w-6xl gap-10 px-5 py-12 sm:px-8 lg:grid-cols-2">
      <div className="aspect-[3/4] animate-pulse bg-[#f3f3f3]" />
      <div className="space-y-5 lg:py-8">
        <div className="h-4 w-28 animate-pulse bg-[#f3f3f3]" />
        <div className="h-12 w-3/4 animate-pulse bg-[#f3f3f3]" />
        <div className="h-7 w-32 animate-pulse bg-[#f3f3f3]" />
        <div className="h-28 w-full animate-pulse bg-[#f3f3f3]" />
      </div>
    </main>
  );
}
