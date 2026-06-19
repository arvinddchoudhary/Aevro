import Link from 'next/link';
import type { Category } from '../../types/catalog';

type CategoryPillsProps = {
  categories: Category[];
  activeCategory?: string;
};

export function CategoryPills({ categories, activeCategory }: CategoryPillsProps) {
  if (categories.length === 0) {
    return null;
  }

  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      <Link
        href="/products"
        className={`shrink-0 border px-4 py-2 text-sm ${
          !activeCategory
            ? 'border-[#111111] bg-[#111111] text-white'
            : 'border-[#dddddd] text-[#555555]'
        }`}
      >
        All
      </Link>
      {categories.map((category) => (
        <Link
          key={category.id}
          href={`/products?category=${category.slug}`}
          className={`shrink-0 border px-4 py-2 text-sm ${
            activeCategory === category.slug
              ? 'border-[#111111] bg-[#111111] text-white'
              : 'border-[#dddddd] text-[#555555]'
          }`}
        >
          {category.name}
        </Link>
      ))}
    </div>
  );
}
