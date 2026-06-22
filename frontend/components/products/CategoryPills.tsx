import Link from 'next/link';
import type { Category } from '../../types/catalog';

type CategoryPillsProps = {
  categories: Category[];
  activeCategory?: string;
  getHref?: (category?: string) => string;
};

export function CategoryPills({
  categories,
  activeCategory,
  getHref = (category?: string) =>
    category ? `/products?category=${category}` : '/products',
}: CategoryPillsProps) {
  if (categories.length === 0) {
    return null;
  }

  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      <Link
        href={getHref(undefined)}
        className={`inline-flex min-w-16 shrink-0 items-center justify-center border px-4 py-2 text-sm font-medium ${
          !activeCategory
            ? 'border-[#111111] bg-[#fffaf3] text-[#111111]'
            : 'border-[#ddd4c8] text-[#5f5a53]'
        }`}
      >
        All
      </Link>
      {categories.map((category) => (
        <Link
          key={category.id}
          href={getHref(category.slug)}
          className={`inline-flex min-w-24 shrink-0 items-center justify-center border px-4 py-2 text-sm font-medium ${
            activeCategory === category.slug
              ? 'border-[#111111] bg-[#fffaf3] text-[#111111]'
              : 'border-[#ddd4c8] text-[#5f5a53]'
          }`}
        >
          {category.name}
        </Link>
      ))}
    </div>
  );
}
