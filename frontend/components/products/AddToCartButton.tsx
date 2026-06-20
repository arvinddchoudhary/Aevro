'use client';

import { useState } from 'react';
import { useCartStore } from '../../lib/cartStore';

type AddToCartButtonProps = {
  productId: string;
  productName: string;
  productSlug: string;
  priceInPaise: number;
  availableColor?: string | null;
  availableSize?: string | null;
  imageUrl?: string | null;
  stock: number;
};

export function AddToCartButton({
  productId,
  productName,
  productSlug,
  priceInPaise,
  availableColor,
  availableSize,
  imageUrl,
  stock,
}: AddToCartButtonProps) {
  const [added, setAdded] = useState(false);

  const handleAddToCart = () => {
    if (stock === 0) return;

    useCartStore.getState().addItem({
      productId,
      productName,
      productSlug,
      priceInPaise,
      quantity: 1,
      selectedColor: availableColor || undefined,
      selectedSize: availableSize || undefined,
      imageUrl: imageUrl || undefined,
    });

    useCartStore.getState().openDrawer();

    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <button
      onClick={handleAddToCart}
      disabled={stock === 0}
      className="flex h-12 w-full items-center justify-center bg-text text-[11px] uppercase tracking-[0.2em] text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
    >
      {stock === 0 ? 'Out of stock' : added ? 'Added ✓' : 'Add to Cart'}
    </button>
  );
}
