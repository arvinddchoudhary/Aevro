export function ProductCardSkeleton() {
  return (
    <div className="w-full bg-white">
      <div className="aspect-[2/3] w-full animate-pulse bg-[#ebebeb]" />
      <div className="mt-4 h-3 w-3/4 animate-pulse bg-[#ebebeb]" />
      <div className="mt-2 h-3 w-1/4 animate-pulse bg-[#ebebeb]" />
      <div className="mt-2 h-3 w-1/2 animate-pulse bg-[#ebebeb]" />
    </div>
  );
}

export function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-px bg-border sm:grid-cols-2 md:grid-cols-3">
      <ProductCardSkeleton />
      <ProductCardSkeleton />
      <ProductCardSkeleton />
    </div>
  );
}

export function ProductPageSkeleton() {
  return (
    <div className="flex min-h-screen flex-col md:grid md:grid-cols-2 md:gap-0">
      <div className="aspect-[3/4] w-full animate-pulse bg-muted md:h-[calc(100vh-64px)] md:aspect-auto" />
      <div className="space-y-4 px-4 py-8 md:p-12 md:pl-16">
        <div className="h-4 w-1/3 bg-[#ebebeb]" />
        <div className="mt-8 h-8 w-3/4 bg-[#ebebeb]" />
        <div className="h-6 w-1/4 bg-[#ebebeb]" />
        <div className="my-6 h-px bg-border" />
        <div className="h-3 w-1/4 bg-[#ebebeb]" />
        <div className="mt-3 flex gap-3">
          <div className="h-8 w-8 rounded-full bg-[#ebebeb]" />
          <div className="h-8 w-8 rounded-full bg-[#ebebeb]" />
          <div className="h-8 w-8 rounded-full bg-[#ebebeb]" />
        </div>
        <div className="mt-6 h-3 w-1/4 bg-[#ebebeb]" />
        <div className="mt-3 flex gap-2">
          <div className="h-10 w-14 bg-[#ebebeb]" />
          <div className="h-10 w-14 bg-[#ebebeb]" />
          <div className="h-10 w-14 bg-[#ebebeb]" />
          <div className="h-10 w-14 bg-[#ebebeb]" />
        </div>
        <div className="mt-8 h-12 w-full bg-[#ebebeb]" />
        <div className="mt-3 h-12 w-full bg-[#ebebeb]" />
      </div>
    </div>
  );
}
