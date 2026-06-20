export function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-px bg-border md:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="bg-white">
          <div className="aspect-[2/3] animate-pulse bg-[#ebebeb]" />
          <div className="mt-3 h-3 w-3/4 animate-pulse bg-[#ebebeb]" />
          <div className="mt-2 h-3 w-1/3 animate-pulse bg-[#ebebeb]" />
        </div>
      ))}
    </div>
  );
}
