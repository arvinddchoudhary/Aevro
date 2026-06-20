import Link from 'next/link';
import { AddToCartButton } from '../cart/AddToCartButton';
import { formatPrice } from '../../lib/format';
import type { Product } from '../../types/catalog';
import { ProductImageFrame } from './ProductImageFrame';

type ProductCardProps = {
  product: Product;
};

export function ProductCard({ product }: ProductCardProps) {
  const primaryImage = product.images[0];

  return (
    <article className="group">
      <Link href={`/products/${product.slug}`} className="group block">
        <ProductImageFrame
          image={primaryImage}
          productName={product.name}
          className="aspect-[3/4]"
        />
        <div className="mt-4">
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-base leading-6 underline-offset-4 group-hover:underline">
              {product.name}
            </h3>
            <span className="shrink-0 text-sm font-medium">
              {formatPrice(product.priceInPaise)}
            </span>
          </div>
          <p className="mt-1 text-sm text-[#666666]">
            {product.category?.name ?? 'AEVRO'}
          </p>
          <p className="mt-3 text-xs uppercase tracking-[0.14em] text-[#777777]">
            {product.stock > 0 ? 'Available' : 'Out of stock'}
          </p>
        </div>
      </Link>
      <AddToCartButton product={product} className="mt-4" />
    </article>
  );
}
