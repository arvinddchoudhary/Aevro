import Link from 'next/link';
import { formatPrice } from '../../lib/format';
import type { Product } from '../../types/catalog';

type ProductCardProps = {
  product: Product;
};

export function ProductCard({ product }: ProductCardProps) {
  const primaryImage = product.images[0];

  return (
    <article>
      <Link href={`/products/${product.slug}`} className="group block">
        <div className="aspect-[3/4] overflow-hidden bg-[#f4f4f4]">
          {primaryImage ? (
            <img
              src={primaryImage.url}
              alt={primaryImage.altText ?? product.name}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-xs uppercase tracking-[0.2em] text-[#999999]">
              Product image
            </div>
          )}
        </div>
        <div className="mt-4">
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-base leading-6">{product.name}</h3>
            <span className="shrink-0 text-sm">{formatPrice(product.priceInPaise)}</span>
          </div>
          <p className="mt-1 text-sm text-[#666666]">
            {product.category?.name ?? 'AEVRO'}
          </p>
          <p className="mt-3 text-xs uppercase tracking-[0.16em] text-[#888888]">
            {product.status}
          </p>
        </div>
      </Link>
    </article>
  );
}
