import Link from 'next/link';
import { formatPrice } from '../../lib/format';
import type { Product } from '../../types/catalog';

type ProductCardProps = {
  product: Product;
};

function getPlaceholderBg(product: Product): string {
  const slug = (product.slug ?? '').toLowerCase();
  const color = (product.color ?? '').toLowerCase();
  const combined = `${slug} ${color}`;

  if (combined.includes('black')) return '#e8e6e3';
  if (combined.includes('charcoal') || combined.includes('grey') || combined.includes('gray'))
    return '#dedad4';
  if (combined.includes('beige') || combined.includes('cream') || combined.includes('sand'))
    return '#ede8df';
  if (combined.includes('navy') || combined.includes('blue')) return '#dde0e5';
  if (combined.includes('olive') || combined.includes('green')) return '#dde2d8';
  return '#ebebeb';
}

function getPlaceholderLabel(product: Product): string {
  if (product.color) return product.color;
  return product.name;
}

export function ProductCard({ product }: ProductCardProps) {
  const primaryImage = product.images[0];
  const placeholderBg = getPlaceholderBg(product);
  const placeholderLabel = getPlaceholderLabel(product);

  return (
    <article>
      <Link href={`/products/${product.slug}`} className="group block cursor-pointer">
        {/* Image area */}
        <div className="relative aspect-[2/3] overflow-hidden bg-muted">
          {primaryImage ? (
            <img
              src={primaryImage.url}
              alt={primaryImage.altText ?? product.name}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
            />
          ) : (
            <div
              className="flex h-full items-center justify-center"
              style={{ backgroundColor: placeholderBg }}
            >
              <span className="text-[10px] uppercase tracking-[0.3em] text-[#aaa]">
                {placeholderLabel}
              </span>
            </div>
          )}

          {/* Quick view overlay */}
          <div className="absolute bottom-3 left-3 right-3 translate-y-2 bg-white/90 py-2.5 text-center text-[10px] uppercase tracking-[0.15em] text-text opacity-0 backdrop-blur-sm transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            View product
          </div>
        </div>

        {/* Info */}
        <div className="px-0">
          <h3 className="mt-3 text-[13px] font-normal tracking-wide text-text">
            {product.name}
          </h3>
          <p className="mt-1 text-[13px] text-secondary">
            {formatPrice(product.priceInPaise)}
          </p>
        </div>
      </Link>
    </article>
  );
}
