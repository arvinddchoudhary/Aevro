'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { useCart } from '../../lib/cart';
import type { Product, ProductImage, ProductVariant } from '../../types/catalog';

type ProductQuickAddButtonProps = {
  product: Product;
};

function productImages(product: Product, variant?: ProductVariant): ProductImage[] {
  return variant?.images.length
    ? variant.images
    : product.images;
}

export function ProductQuickAddButton({ product }: ProductQuickAddButtonProps) {
  const { addProduct } = useCart();
  const variants = product.variants ?? [];
  const firstVariant = variants.find((variant) => variant.stock > 0) ?? variants[0];
  const [isOpen, setIsOpen] = useState(false);
  const [selectedColorSlug, setSelectedColorSlug] = useState(firstVariant?.colorSlug ?? '');
  const [selectedSize, setSelectedSize] = useState('');
  const [wasAdded, setWasAdded] = useState(false);

  const colors = useMemo(
    () => Array.from(new Map(variants.map((variant) => [variant.colorSlug, variant])).values()),
    [variants],
  );
  const sizes = variants.filter((variant) => variant.colorSlug === selectedColorSlug);
  const selectedVariant = sizes.find((variant) => variant.size === selectedSize);
  const hasVariants = variants.length > 0;
  const canAdd = hasVariants
    ? Boolean(selectedVariant && selectedVariant.stock > 0)
    : product.status === 'ACTIVE' && product.stock > 0;

  const selectColor = (colorSlug: string) => {
    setSelectedColorSlug(colorSlug);
    setSelectedSize('');
    setWasAdded(false);
  };

  const open = () => {
    setWasAdded(false);
    setIsOpen(true);
  };

  const addToBag = () => {
    const images = productImages(product, selectedVariant);
    const image = images.find((item) => item.isPrimary) ?? images[0];
    const added = addProduct(product, selectedVariant
      ? {
          variantId: selectedVariant.id,
          selectedColor: selectedVariant.colorName,
          selectedSize: selectedVariant.size,
          stock: selectedVariant.stock,
          imageUrl: image?.url,
          imageAltText: image?.altText,
        }
      : undefined);

    setWasAdded(added);
  };

  return (
    <>
      <button
        type="button"
        onClick={open}
        disabled={product.status !== 'ACTIVE' || product.stock <= 0}
        className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#d8cfc2] text-lg leading-none text-[#111111] transition hover:border-[#111111] hover:bg-[#111111] hover:text-[#fffaf3] disabled:cursor-not-allowed disabled:opacity-40 sm:h-9 sm:w-9"
        aria-label={`Quick add ${product.name} to bag`}
      >
        +
      </button>

      {isOpen ? createPortal(
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-[#111111]/45 p-3 backdrop-blur-[2px] sm:items-center sm:p-6"
          onClick={() => setIsOpen(false)}
          role="presentation"
        >
          <section
            className="rounded-[10px] border border-[#ded6cc] bg-[#fffaf3] p-5 shadow-[0_24px_70px_rgba(17,17,17,0.22)] sm:p-6"
            style={{ width: 'min(100%, 30rem)' }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="quick-add-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#77716a]">Quick add</p>
                <h2 id="quick-add-title" className="mt-2 text-xl font-light uppercase leading-tight">{product.name}</h2>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-[#ddd4c8] text-lg transition hover:border-[#111111]"
                aria-label="Close quick add"
              >
                ×
              </button>
            </div>

            {hasVariants ? (
              <div className="mt-6 space-y-5">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.12em]">Colour</p>
                  <div className="mt-3 flex flex-wrap gap-2.5">
                    {colors.map((color) => (
                      <button
                        key={color.colorSlug}
                        type="button"
                        onClick={() => selectColor(color.colorSlug)}
                        className={`flex h-9 w-9 items-center justify-center rounded-full border transition ${selectedColorSlug === color.colorSlug ? 'border-[#111111] ring-1 ring-[#111111] ring-offset-2 ring-offset-[#fffaf3]' : 'border-[#d8cfc2]'}`}
                        aria-label={color.colorName}
                      >
                        <span className="h-5 w-5 rounded-full border border-[#111111]/15" style={{ backgroundColor: color.colorHex ?? '#d8cfc2' }} />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.12em]">Size</p>
                  <div className="mt-3 grid grid-cols-5 gap-2">
                    {sizes.map((variant) => (
                      <button
                        key={variant.id}
                        type="button"
                        disabled={variant.stock <= 0}
                        onClick={() => {
                          setSelectedSize(variant.size);
                          setWasAdded(false);
                        }}
                        className={`h-10 border text-sm transition disabled:cursor-not-allowed disabled:opacity-35 ${selectedSize === variant.size ? 'border-[#111111] bg-[#111111] text-[#fffaf3]' : 'border-[#d8cfc2] hover:border-[#111111]'}`}
                      >
                        {variant.size}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}

            {wasAdded ? (
              <div className="mt-6 border border-[#b8d7c1] bg-[#f4fbf5] p-3 text-sm text-[#1f6b3a]" role="status">
                1 item added to your bag.
              </div>
            ) : null}

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {wasAdded ? (
                <Link
                  href="/cart"
                  className="inline-flex h-11 items-center justify-center bg-[#111111] px-4 text-xs font-medium uppercase tracking-[0.08em] text-[#fffaf3] hover:bg-[#2a2825]"
                  style={{ color: '#fffaf3' }}
                >
                  Go to bag
                </Link>
              ) : (
                <button
                  type="button"
                  disabled={!canAdd}
                  onClick={addToBag}
                  className="h-11 whitespace-nowrap bg-[#111111] px-4 text-xs font-medium uppercase tracking-[0.08em] text-[#fffaf3] transition hover:bg-[#2a2825] disabled:cursor-not-allowed disabled:bg-[#aaa39a]"
                >
                  {hasVariants && !selectedVariant ? 'Select size' : 'Add to bag'}
                </button>
              )}
              <Link
                href={`/products/${product.slug}`}
                className="inline-flex h-11 items-center justify-center border border-[#111111] px-4 text-xs font-medium uppercase tracking-[0.08em] transition hover:bg-[#f1e9de]"
              >
                View product
              </Link>
            </div>
          </section>
        </div>
      , document.body) : null}
    </>
  );
}
