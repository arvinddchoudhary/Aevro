'use client';

import Link from 'next/link';
import { useMemo, useRef, useState } from 'react';
import { formatPrice } from '../../lib/format';
import type { Product, ProductImage } from '../../types/catalog';
import { ProductImageFrame } from './ProductImageFrame';
import { WishlistToggleButton } from '../wishlist/WishlistToggleButton';
import { ProductQuickAddButton } from './ProductQuickAddButton';

type ProductCardProps = {
  product: Product;
  compact?: boolean;
  shopMobile?: boolean;
  imageSizes?: string;
};

export function ProductCard({
  product,
  compact = false,
  shopMobile = false,
  imageSizes = '(max-width: 767px) 33vw, (max-width: 1023px) 33vw, (max-width: 1279px) 25vw, 20vw',
}: ProductCardProps) {
  const primaryImage = product.primaryImage ?? product.images[0];
  const images = useMemo<ProductImage[]>(() => {
    const primaryVariant = product.variants?.find(
      (variant) => variant.images.some((image) => image.id === primaryImage?.id),
    );
    const colorImages = primaryVariant
      ? product.imagesByColor?.[primaryVariant.colorSlug] ?? primaryVariant.images
      : product.images.filter((image) => !image.variantId);

    return colorImages.length ? colorImages : primaryImage ? [primaryImage] : [];
  }, [primaryImage, product.images, product.imagesByColor, product.variants]);
  const initialImageIndex = Math.max(0, images.findIndex((image) => image.id === primaryImage?.id));
  const [imageIndex, setImageIndex] = useState(initialImageIndex);
  const touchStartX = useRef<number | null>(null);
  const didSwipe = useRef(false);
  const displayedImage = images[imageIndex] ?? primaryImage;
  const displayName =
    shopMobile && product.name === product.name.toUpperCase()
      ? product.name.toLowerCase().replace(/(^|\s)\S/g, (character) => character.toUpperCase())
      : product.name;
  const changeImage = (direction: 1 | -1) => {
    if (images.length < 2) return;
    setImageIndex((current) => (current + direction + images.length) % images.length);
  };

  const handleTouchEnd = (clientX: number) => {
    if (touchStartX.current === null) return;
    const distance = clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(distance) < 36) return;
    didSwipe.current = true;
    changeImage(distance < 0 ? 1 : -1);
  };

  return (
    <article className="group relative min-w-0 overflow-hidden rounded-[8px] border border-[#ded6cc] bg-[#fffaf3] transition duration-300 hover:-translate-y-0.5 hover:border-[#bfb4a8] hover:shadow-[0_18px_45px_rgba(49,37,26,0.08)] lg:rounded-[4px]">
      <Link
        href={`/products/${product.slug}`}
        className="group block cursor-pointer"
        onClick={(event) => {
          if (didSwipe.current) {
            event.preventDefault();
            didSwipe.current = false;
          }
        }}
      >
        <div
          onTouchStart={(event) => {
            touchStartX.current = event.touches[0]?.clientX ?? null;
            didSwipe.current = false;
          }}
          onTouchEnd={(event) => handleTouchEnd(event.changedTouches[0]?.clientX ?? 0)}
        >
          <ProductImageFrame
            image={displayedImage}
            productName={product.name}
            className={
              shopMobile
                ? 'aspect-[3/4] lg:aspect-[4/5]'
                : compact
                  ? 'aspect-[4/5]'
                  : 'aspect-[3/4]'
            }
            imageClassName="object-cover object-center"
            sizes={imageSizes}
            loading="lazy"
          />
        </div>
      </Link>
      <div className="border-t border-[#eee5da] p-3 sm:p-4 lg:p-5">
        <div className="flex items-start justify-between gap-2 sm:gap-3">
          <Link
            href={`/products/${product.slug}`}
            className={`line-clamp-2 min-w-0 leading-5 underline-offset-4 hover:underline ${
              shopMobile
                ? 'text-[0.76rem] font-medium normal-case tracking-normal sm:text-sm lg:text-[0.82rem] lg:font-semibold lg:uppercase lg:tracking-[0.03em]'
                : 'text-[0.72rem] font-semibold uppercase tracking-[0.03em] sm:text-[0.82rem]'
            }`}
          >
            {displayName}
          </Link>
          <ProductQuickAddButton product={product} />
        </div>
          <p className="mt-1.5 hidden truncate text-xs text-[#514c45] sm:mt-2 sm:text-sm lg:block">
            {product.category?.name ?? 'AEVRO'}
          </p>
          <p className="mt-2 text-sm font-semibold sm:mt-3">{formatPrice(product.priceInPaise)}</p>
      </div>
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
