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
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1.08fr)_minmax(380px,0.92fr)] lg:gap-14">
      <section>
        <ProductImageFrame
          image={selectedImage}
          productName={product.name}
          className="aspect-[4/5] w-full"
        />

        <div className="mt-4 grid grid-cols-4 gap-3 sm:grid-cols-5">
          {(colorImages.length > 0 ? colorImages : [undefined]).map((image, index) => (
            <button
              key={image?.id ?? index}
              type="button"
              onClick={() => setSelectedImageId(image?.id ?? null)}
              className={`cursor-pointer border ${
                image?.id === selectedImage?.id ? 'border-[#111111]' : 'border-[#eeeeee]'
              }`}
              aria-label={`View ${product.name} image ${index + 1}`}
            >
              <ProductImageFrame
                image={image}
                productName={product.name}
                className="aspect-square"
              />
            </button>
          ))}
        </div>
      </section>

      <section className="lg:sticky lg:top-24 lg:self-start">
        <p className="mb-4 text-xs uppercase tracking-[0.24em] text-[#777777]">
          {product.category?.name ?? 'AEVRO'}
        </p>
        <h1 className="max-w-2xl text-4xl font-light leading-[1.08] md:text-6xl">
          {product.name}
        </h1>
        <p className="mt-6 text-2xl">{formatPrice(product.priceInPaise)}</p>

        {product.description && (
          <p className="mt-8 max-w-xl text-base leading-8 text-[#555555]">
            {product.description}
          </p>
        )}

        <div className="mt-10 border-y border-[#e5e5e5] py-6">
          <div>
            <div className="mb-3 flex items-center justify-between gap-4">
              <p className="text-xs uppercase tracking-[0.18em] text-[#777777]">
                Colour
              </p>
              <p className="text-sm">{selectedColor?.colorName ?? 'Select'}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              {colors.map((color) => (
                <button
                  key={color.colorSlug}
                  type="button"
                  onClick={() => selectColor(color.colorSlug)}
                  className={`flex h-11 cursor-pointer items-center gap-3 border px-4 text-sm ${
                    selectedColorSlug === color.colorSlug
                      ? 'border-[#111111]'
                      : 'border-[#d9d9d9]'
                  }`}
                >
                  <span
                    className="h-4 w-4 border border-[#d9d9d9]"
                    style={{ backgroundColor: color.colorHex ?? '#111111' }}
                  />
                  {color.colorName}
                  {color.lowStock && color.totalStock > 0 ? (
                    <span className="text-xs uppercase tracking-[0.12em] text-[#8a1f1f]">
                      Low
                    </span>
                  ) : null}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-7">
            <div className="mb-3 flex items-center justify-between gap-4">
              <p className="text-xs uppercase tracking-[0.18em] text-[#777777]">
                Size
              </p>
              <p className="text-sm text-[#555555]">{stockLabel}</p>
            </div>
            <div className="grid grid-cols-4 gap-3 sm:grid-cols-5">
              {availableSizes.map((size) => (
                <button
                  key={size.variantId}
                  type="button"
                  disabled={size.stock <= 0}
                  onClick={() => setSelectedSize(size.size)}
                  className={`h-11 cursor-pointer border text-sm disabled:cursor-not-allowed disabled:border-[#eeeeee] disabled:text-[#bbbbbb] ${
                    selectedSize === size.size
                      ? 'border-[#111111] bg-[#111111] text-white'
                      : 'border-[#d9d9d9]'
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

        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <div className="border border-[#e5e5e5] px-5 py-4">
            <p className="text-xs uppercase tracking-[0.18em] text-[#777777]">
              Fit
            </p>
            <p className="mt-2 text-sm leading-6">Wide leg, relaxed drape</p>
          </div>
          <div className="border border-[#e5e5e5] px-5 py-4">
            <p className="text-xs uppercase tracking-[0.18em] text-[#777777]">
              Fabric
            </p>
            <p className="mt-2 text-sm leading-6">Premium everyday weight</p>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
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
            className="sm:min-w-48"
          />
          {product.category && (
            <Link
              href={`/products?category=${product.category.slug}`}
              className="inline-flex h-12 min-w-40 cursor-pointer items-center justify-center border border-[#d9d9d9] px-7 text-sm font-medium uppercase tracking-[0.08em] hover:border-[#111111]"
            >
              More {product.category.name}
            </Link>
          )}
        </div>
      </section>
    </div>
  );
}
