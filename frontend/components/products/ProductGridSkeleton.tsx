export function ProductGridSkeleton() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index}>
          <div className="aspect-[3/4] animate-pulse bg-[#f3f3f3]" />
          <div className="mt-4 h-4 w-3/4 animate-pulse bg-[#f3f3f3]" />
          <div className="mt-2 h-4 w-1/3 animate-pulse bg-[#f3f3f3]" />
        </div>
      ))}
    </div>
  );
}
