'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { AddToCartButton } from '../cart/AddToCartButton';
import { WishlistToggleButton } from '../wishlist/WishlistToggleButton';
import { formatPrice } from '../../lib/format';
import type {
  Product,
  ProductColorOption,
  ProductImage,
  ProductSizeOption,
} from '../../types/catalog';
import { ProductImageFrame } from './ProductImageFrame';
import { ProductImageLightbox } from './ProductImageLightbox';

type ProductVariantSelectionProps = {
  product: Product;
};

function buildColors(product: Product): ProductColorOption[] {
  if (product.availableColors?.length) {
    return product.availableColors;
  }

  const colors = new Map<string, ProductColorOption>();

  product.variants?.forEach((variant) => {
    const existing = colors.get(variant.colorSlug);

    colors.set(variant.colorSlug, {
      colorName: variant.colorName,
      colorSlug: variant.colorSlug,
      colorHex: variant.colorHex,
      totalStock: (existing?.totalStock ?? 0) + variant.stock,
    });
  });

  return Array.from(colors.values());
}

function buildSizes(product: Product): Record<string, ProductSizeOption[]> {
  if (product.sizesByColor) {
    return product.sizesByColor;
  }

  return (
    product.variants?.reduce<Record<string, ProductSizeOption[]>>((groups, variant) => {
      groups[variant.colorSlug] = [
        ...(groups[variant.colorSlug] ?? []),
        {
          variantId: variant.id,
          size: variant.size,
          stock: variant.stock,
        },
      ];

      return groups;
    }, {}) ?? {}
  );
}

function buildImages(product: Product): Record<string, ProductImage[]> {
  if (product.imagesByColor) {
    return product.imagesByColor;
  }

  return (
    product.variants?.reduce<Record<string, ProductImage[]>>((groups, variant) => {
      groups[variant.colorSlug] = [
        ...(groups[variant.colorSlug] ?? []),
        ...variant.images,
      ];

      return groups;
    }, {}) ?? {}
  );
}

export function ProductVariantSelection({ product }: ProductVariantSelectionProps) {
  const colors = useMemo(() => buildColors(product), [product]);
  const sizesByColor = useMemo(() => buildSizes(product), [product]);
  const imagesByColor = useMemo(() => buildImages(product), [product]);
  const firstColor = colors[0]?.colorSlug ?? product.color ?? '';
  const [selectedColorSlug, setSelectedColorSlug] = useState(firstColor);
  const [selectedSize, setSelectedSize] = useState('');
  const colorImages = imagesByColor[selectedColorSlug] ?? product.images;
  const [selectedImageId, setSelectedImageId] = useState<string | null>(
    (colorImages.find((image) => image.isPrimary) ?? colorImages[0])?.id ?? null,
  );
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const selectedColor = colors.find((color) => color.colorSlug === selectedColorSlug);
  const availableSizes = sizesByColor[selectedColorSlug] ?? [];
  const selectedVariant = availableSizes.find((size) => size.size === selectedSize);
  const selectedImage =
    colorImages.find((image) => image.id === selectedImageId) ??
    colorImages.find((image) => image.isPrimary) ??
    colorImages[0] ??
    product.primaryImage ??
    product.images[0];
  const canAddToCart = Boolean(selectedColor && selectedVariant && selectedVariant.stock > 0);
  const stockLabel = selectedVariant
    ? selectedVariant.stock > 0
      ? selectedVariant.lowStock
        ? `Only ${selectedVariant.stock} left`
        : `${selectedVariant.stock} available`
      : 'Out of stock'
    : selectedColor
      ? 'Select a size'
      : 'Select a colour';

  const selectColor = (colorSlug: string) => {
    const nextImages = imagesByColor[colorSlug] ?? product.images;
    const nextPrimaryImage = nextImages.find((image) => image.isPrimary) ?? nextImages[0];

    setSelectedColorSlug(colorSlug);
    setSelectedSize('');
    setSelectedImageId(nextPrimaryImage?.id ?? null);
  };

  const selectedImageIndex = colorImages.findIndex((image) => image.id === selectedImage?.id);
  const canGoPrevious = selectedImageIndex > 0;
  const canGoNext = selectedImageIndex < colorImages.length - 1;

  const goToPreviousImage = () => {
    if (!canGoPrevious) return;
    setSelectedImageId(colorImages[selectedImageIndex - 1].id);
  };

  const goToNextImage = () => {
    if (!canGoNext) return;
    setSelectedImageId(colorImages[selectedImageIndex + 1].id);
  };

  useEffect(() => {
    if (colorImages.length <= 1) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        goToPreviousImage();
      } else if (event.key === 'ArrowRight') {
        goToNextImage();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [colorImages, selectedImageIndex]);

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,560px)_minmax(360px,1fr)] lg:gap-10 xl:grid-cols-[minmax(0,620px)_minmax(400px,1fr)]">
      <section className="mx-auto grid w-full max-w-[620px] gap-3 sm:grid-cols-[76px_minmax(0,520px)] sm:gap-4 xl:grid-cols-[82px_minmax(0,540px)]">
        <div className="order-2 grid grid-cols-4 gap-2 overflow-x-auto pb-1 sm:order-1 sm:block sm:space-y-4 sm:overflow-visible sm:pb-0">
          {(colorImages.length > 0 ? colorImages : [undefined]).map((image, index) => (
            <button
              key={image?.id ?? index}
              type="button"
              onClick={() => setSelectedImageId(image?.id ?? null)}
              className={`min-w-[68px] cursor-pointer overflow-hidden rounded-[5px] border bg-[#eee8de] transition hover:border-[#111111] sm:min-w-0 ${
                image?.id === selectedImage?.id ? 'border-[#111111]' : 'border-[#ddd4c8]'
              }`}
              aria-label={`View ${product.name} image ${index + 1}`}
            >
              <ProductImageFrame
                image={image}
                productName={product.name}
                className="aspect-square rounded-[4px]"
              />
            </button>
          ))}
        </div>
        <div className="order-1 relative sm:order-2">
          <button
            type="button"
            onClick={() => setIsLightboxOpen(true)}
            className="block w-full cursor-zoom-in text-left"
            aria-label={`Open full image of ${product.name}`}
          >
            <ProductImageFrame
              image={selectedImage}
              productName={product.name}
              className="aspect-[4/5] w-full rounded-[8px] sm:aspect-[1086/1448] sm:max-w-[540px] sm:rounded-[6px]"
              imageClassName="object-contain"
            />
          </button>

          {colorImages.length > 1 && (
            <>
              <button
                type="button"
                onClick={goToPreviousImage}
                disabled={!canGoPrevious}
                className="absolute left-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-[#e8e0d6] bg-[#fffaf3]/90 text-[#111111] shadow-sm backdrop-blur-sm transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-30 sm:left-3 sm:h-10 sm:w-10"
                aria-label="Previous image"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="m15 18-6-6 6-6" />
                </svg>
              </button>
              <button
                type="button"
                onClick={goToNextImage}
                disabled={!canGoNext}
                className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-[#e8e0d6] bg-[#fffaf3]/90 text-[#111111] shadow-sm backdrop-blur-sm transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-30 sm:right-3 sm:h-10 sm:w-10"
                aria-label="Next image"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </button>
              <div className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-[#fffaf3]/90 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.08em] text-[#514c45] shadow-sm backdrop-blur-sm">
                {selectedImageIndex + 1} / {colorImages.length}
              </div>
            </>
          )}
        </div>
      </section>

      <section className="max-w-[520px] lg:sticky lg:top-24 lg:self-start">
        <span className="mb-3 inline-flex rounded-full bg-[#efe8df] px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.08em] text-[#514c45]">
          Best seller
        </span>
        <h1 className="max-w-2xl text-[1.55rem] font-light uppercase leading-[1.08] sm:text-3xl md:text-4xl">
          {product.name}
        </h1>
        <p className="mt-4 text-lg font-semibold sm:text-xl">{formatPrice(product.priceInPaise)}</p>
        <p className="mt-1 text-sm text-[#514c45]">Inclusive of all taxes</p>

        {product.description && (
          <p className="mt-4 max-w-xl text-sm leading-6 text-[#2f2a25]">
            {product.description}
          </p>
        )}

        <div className="mt-5 border-y border-[#ddd4c8] py-4 sm:py-5">
          <div>
            <div className="mb-3 flex items-center justify-between gap-4">
              <p className="text-xs font-semibold uppercase tracking-[0.12em]">
                Color: <span className="font-normal">{selectedColor?.colorName ?? 'Select'}</span>
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              {colors.map((color) => (
                <button
                  key={color.colorSlug}
                  type="button"
                  onClick={() => selectColor(color.colorSlug)}
                  className={`flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border text-sm transition ${
                    selectedColorSlug === color.colorSlug
                      ? 'border-[#111111] ring-2 ring-[#111111] ring-offset-2 ring-offset-[#fbf7f0]'
                      : 'border-[#ddd4c8]'
                  }`}
                  aria-label={color.colorName}
                >
                  <span
                    className="h-6 w-6 rounded-full border border-[#ddd4c8]"
                    style={{ backgroundColor: color.colorHex ?? '#111111' }}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 sm:mt-5">
            <div className="mb-3 flex items-center justify-between gap-4">
              <p className="text-xs font-semibold uppercase tracking-[0.12em]">
                Size: <span className="text-[#77716a]">{selectedSize || 'Select your size'}</span>
              </p>
              <p className="text-xs text-[#514c45]">{stockLabel}</p>
            </div>
            <div className="grid grid-cols-4 gap-2.5 sm:grid-cols-5 sm:gap-3">
              {availableSizes.map((size) => (
                <button
                  key={size.variantId}
                  type="button"
                  disabled={size.stock <= 0}
                  onClick={() => setSelectedSize(size.size)}
                  className={`h-11 cursor-pointer rounded-[4px] border text-sm transition disabled:cursor-not-allowed disabled:border-[#e8ded2] disabled:text-[#b6aea5] ${
                    selectedSize === size.size
                      ? 'border-[#111111] bg-[#fffaf3] text-[#111111] shadow-[inset_0_0_0_1px_#111111]'
                      : 'border-[#ddd4c8] bg-transparent hover:border-[#111111]'
                  }`}
                >
                  <span>{size.size}</span>
                  {size.stock > 0 && size.lowStock ? (
                    <span className="ml-1 text-[10px] uppercase tracking-[0.08em]">
                      Low
                    </span>
                  ) : null}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-3 sm:mt-5">
          <AddToCartButton
            product={product}
            selection={{
              variantId: selectedVariant?.variantId,
              selectedColor: selectedColor?.colorName,
              selectedSize,
              stock: selectedVariant?.stock ?? 0,
              imageUrl: selectedImage?.url,
              imageAltText: selectedImage?.altText,
            }}
            disabled={!canAddToCart}
            disabledLabel={selectedVariant?.stock === 0 ? 'Out of stock' : 'Select options'}
            className="w-full"
          />
          <WishlistToggleButton
            productId={product.id}
            variantId={selectedVariant?.variantId}
            label="Add to Wishlist"
            className="w-full"
          />
          {product.category && (
            <Link
              href={`/products?category=${product.category.slug}`}
              className="inline-flex h-11 w-full cursor-pointer items-center justify-center rounded-[4px] border border-[#111111] px-7 text-xs font-semibold uppercase tracking-[0.08em] hover:bg-[#111111] hover:text-[#fffaf3]"
            >
              More {product.category.name}
            </Link>
          )}
        </div>
        <div className="mt-5 border-t border-[#ddd4c8]">
          {['Details', 'Fabric & care', 'Shipping & returns'].map((item) => (
            <details key={item} className="group border-b border-[#ddd4c8] py-3">
              <summary className="flex list-none items-center justify-between text-xs font-semibold uppercase tracking-[0.1em]">
                {item}
                <span className="text-lg leading-none group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 text-sm leading-6 text-[#514c45]">
                Premium everyday construction with a clean drape, refined finish,
                and considered proportions.
              </p>
            </details>
          ))}
        </div>
      </section>

      <div className="fixed inset-x-0 bottom-[4.85rem] z-30 border-t border-[#ddd4c8] bg-[#fbf7f0]/96 px-4 py-3 shadow-[0_-12px_36px_rgba(49,37,26,0.08)] backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-md items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold uppercase tracking-[0.08em]">
              {product.name}
            </p>
            <p className="text-sm font-semibold">{formatPrice(product.priceInPaise)}</p>
          </div>
          <WishlistToggleButton
            productId={product.id}
            variantId={selectedVariant?.variantId}
            variant="icon"
            className="shrink-0"
          />
          <AddToCartButton
            product={product}
            selection={{
              variantId: selectedVariant?.variantId,
              selectedColor: selectedColor?.colorName,
              selectedSize,
              stock: selectedVariant?.stock ?? 0,
              imageUrl: selectedImage?.url,
              imageAltText: selectedImage?.altText,
            }}
            disabled={!canAddToCart}
            disabledLabel={selectedVariant?.stock === 0 ? 'Out' : 'Select'}
            className="w-[8rem] shrink-0"
          />
        </div>
      </div>

      <ProductImageLightbox
        images={colorImages}
        currentIndex={selectedImageIndex >= 0 ? selectedImageIndex : 0}
        productName={product.name}
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
        onPrevious={goToPreviousImage}
        onNext={goToNextImage}
      />
    </div>
  );
}
