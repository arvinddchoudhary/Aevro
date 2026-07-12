import Link from 'next/link';
import { formatPrice } from '../../lib/format';
import type { Product } from '../../types/catalog';
import { ProductImageFrame } from './ProductImageFrame';
import { WishlistToggleButton } from '../wishlist/WishlistToggleButton';

type ProductCardProps = {
  product: Product;
  compact?: boolean;
  shopMobile?: boolean;
};

export function ProductCard({
  product,
  compact = false,
  shopMobile = false,
}: ProductCardProps) {
  const primaryImage = product.primaryImage ?? product.images[0];
  const displayName =
    shopMobile && product.name === product.name.toUpperCase()
      ? product.name.toLowerCase().replace(/(^|\s)\S/g, (character) => character.toUpperCase())
      : product.name;
  const colorOptions = product.availableColors?.slice(0, 4) ?? [];

  return (
    <article className="group relative min-w-0 overflow-hidden rounded-[8px] border border-[#ded6cc] bg-[#fffaf3] transition duration-300 hover:-translate-y-0.5 hover:border-[#bfb4a8] hover:shadow-[0_18px_45px_rgba(49,37,26,0.08)] lg:rounded-[4px]">
      <Link href={`/products/${product.slug}`} className="group block cursor-pointer">
        <ProductImageFrame
          image={primaryImage}
          productName={product.name}
          className={
            shopMobile
              ? 'aspect-square lg:aspect-[4/5]'
              : compact
                ? 'aspect-[4/5]'
                : 'aspect-[3/4]'
          }
          imageClassName="object-cover object-center"
        />
        <div className="border-t border-[#eee5da] p-3 sm:p-4 lg:p-5">
          <div className="flex items-start justify-between gap-2 sm:gap-3">
            <h3
              className={`line-clamp-2 min-w-0 leading-5 underline-offset-4 group-hover:underline ${
                shopMobile
                  ? 'text-[0.76rem] font-medium normal-case tracking-normal sm:text-sm lg:text-[0.82rem] lg:font-semibold lg:uppercase lg:tracking-[0.03em]'
                  : 'text-[0.72rem] font-semibold uppercase tracking-[0.03em] sm:text-[0.82rem]'
              }`}
            >
              {displayName}
            </h3>
            <span className="hidden shrink-0 text-lg leading-none text-[#111111] sm:text-xl lg:inline">+</span>
          </div>
          <p className="mt-1.5 hidden truncate text-xs text-[#514c45] sm:mt-2 sm:text-sm lg:block">
            {product.category?.name ?? 'AEVRO'}
          </p>
          <p className="mt-2 text-sm font-semibold sm:mt-3">{formatPrice(product.priceInPaise)}</p>
          {shopMobile && colorOptions.length > 0 ? (
            <div className="mt-3 flex items-center gap-2 lg:hidden" aria-label="Available colors">
              {colorOptions.map((option) => (
                <span
                  key={option.colorSlug}
                  title={option.colorName}
                  className="h-4 w-4 rounded-[2px] border border-[#111111]/25"
                  style={{ backgroundColor: option.colorHex ?? '#d8cfc2' }}
                />
              ))}
            </div>
          ) : null}
        </div>
      </Link>
      <WishlistToggleButton
        productId={product.id}
        variant="icon"
        className={`absolute right-2 top-2 z-10 sm:right-3 sm:top-3 ${
          shopMobile
            ? '[&_button]:h-8 [&_button]:w-8 [&_svg]:h-4 [&_svg]:w-4 lg:[&_button]:h-10 lg:[&_button]:w-10 lg:[&_svg]:h-5 lg:[&_svg]:w-5'
            : ''
        }`}
      />
    </article>
  );
}
