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
    <div className="inline-flex gap-2 overflow-x-auto pb-1">
      <Link
        href="/products"
        className={`shrink-0 px-4 py-2 text-[11px] uppercase tracking-[0.1em] transition-colors ${!activeCategory
            ? 'border border-text bg-text text-white'
            : 'border border-border bg-white text-secondary hover:border-text'
          }`}
      >
        All
      </Link>
      {categories.map((category) => (
        <Link
          key={category.id}
          href={`/products?category=${category.slug}`}
          className={`shrink-0 px-4 py-2 text-[11px] uppercase tracking-[0.1em] transition-colors ${activeCategory === category.slug
              ? 'border border-text bg-text text-white'
              : 'border border-border bg-white text-secondary hover:border-text'
            }`}
        >
          {category.name}
        </Link>
      ))}
    </div>
  );
}