'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { AddToCartButton } from '../cart/AddToCartButton';
import { formatPrice } from '../../lib/format';
import type {
  Product,
  ProductColorOption,
  ProductImage,
  ProductSizeOption,
} from '../../types/catalog';
import { ProductImageFrame } from './ProductImageFrame';

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

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,650px)_minmax(420px,1fr)] lg:gap-12 xl:grid-cols-[minmax(0,680px)_minmax(440px,1fr)]">
      <section className="grid max-w-[680px] gap-4 sm:grid-cols-[84px_minmax(0,560px)] xl:grid-cols-[88px_minmax(0,580px)]">
        <div className="order-2 grid grid-cols-4 gap-3 sm:order-1 sm:block sm:space-y-4">
          {(colorImages.length > 0 ? colorImages : [undefined]).map((image, index) => (
            <button
              key={image?.id ?? index}
              type="button"
              onClick={() => setSelectedImageId(image?.id ?? null)}
              className={`cursor-pointer overflow-hidden rounded-[5px] border bg-[#eee8de] transition hover:border-[#111111] ${
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
        {selectedImage?.url ? (
          <a
            href={selectedImage.url}
            target="_blank"
            rel="noreferrer"
            className="order-1 block cursor-zoom-in sm:order-2"
            aria-label={`Open full image of ${product.name}`}
          >
            <ProductImageFrame
              image={selectedImage}
              productName={product.name}
              className="aspect-[1086/1448] w-full max-w-[580px] rounded-[6px]"
            />
          </a>
        ) : (
          <ProductImageFrame
            image={selectedImage}
            productName={product.name}
            className="order-1 aspect-[1086/1448] w-full max-w-[580px] rounded-[6px] sm:order-2"
          />
        )}
      </section>

      <section className="max-w-[560px] lg:sticky lg:top-24 lg:self-start">
        <span className="mb-3 inline-flex rounded-full bg-[#efe8df] px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.08em] text-[#514c45]">
          Best seller
        </span>
        <h1 className="max-w-2xl text-3xl font-light uppercase leading-[1.03] tracking-[0.01em] md:text-4xl">
          {product.name}
        </h1>
        <p className="mt-4 text-xl font-semibold">{formatPrice(product.priceInPaise)}</p>
        <p className="mt-1 text-sm text-[#514c45]">Inclusive of all taxes</p>

        {product.description && (
          <p className="mt-4 max-w-xl text-sm leading-6 text-[#2f2a25]">
            {product.description}
          </p>
        )}

        <div className="mt-6 border-y border-[#ddd4c8] py-5">
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

          <div className="mt-5">
            <div className="mb-3 flex items-center justify-between gap-4">
              <p className="text-xs font-semibold uppercase tracking-[0.12em]">
                Size: <span className="text-[#77716a]">{selectedSize || 'Select your size'}</span>
              </p>
              <p className="text-xs text-[#514c45]">{stockLabel}</p>
            </div>
            <div className="grid grid-cols-4 gap-3 sm:grid-cols-5">
              {availableSizes.map((size) => (
                <button
                  key={size.variantId}
                  type="button"
                  disabled={size.stock <= 0}
                  onClick={() => setSelectedSize(size.size)}
                  className={`h-10 cursor-pointer rounded-[4px] border text-sm transition disabled:cursor-not-allowed disabled:border-[#e8ded2] disabled:text-[#b6aea5] ${
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

        <div className="mt-5 flex flex-col gap-3">
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
          {product.category && (
            <Link
              href={`/products?category=${product.category.slug}`}
              className="inline-flex h-11 w-full cursor-pointer items-center justify-center rounded-[4px] border border-[#111111] px-7 text-xs font-semibold uppercase tracking-[0.08em] hover:bg-[#111111] hover:text-[#fffaf3]"
            >
              More {product.category.name}
            </Link>
          )}
        </div>
        <div className="mt-6 border-t border-[#ddd4c8]">
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
    </div>
  );
}
