import Link from 'next/link';
import { formatPrice } from '../../lib/format';
import type { Product } from '../../types/catalog';
import { ProductImageFrame } from './ProductImageFrame';

type ProductCardProps = {
  product: Product;
  compact?: boolean;
};

export function ProductCard({ product, compact = false }: ProductCardProps) {
  const primaryImage = product.primaryImage ?? product.images[0];

  return (
    <article className="group overflow-hidden rounded-[4px] border border-[#ded6cc] bg-[#fffaf3] transition duration-300 hover:-translate-y-0.5 hover:border-[#bfb4a8] hover:shadow-[0_18px_45px_rgba(49,37,26,0.08)]">
      <Link href={`/products/${product.slug}`} className="group block cursor-pointer">
        <ProductImageFrame
          image={primaryImage}
          productName={product.name}
          className={compact ? 'aspect-[4/5]' : 'aspect-[3/4]'}
        />
        <div className="border-t border-[#eee5da] p-4 sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-[0.82rem] font-semibold uppercase leading-5 tracking-[0.03em] underline-offset-4 group-hover:underline">
              {product.name}
            </h3>
            <span className="shrink-0 text-xl leading-none text-[#111111]">+</span>
          </div>
          <p className="mt-2 text-sm text-[#514c45]">
            {product.category?.name ?? 'AEVRO'}
          </p>
          <p className="mt-3 text-sm font-semibold">{formatPrice(product.priceInPaise)}</p>
        </div>
      </Link>
    </article>
  );
}
