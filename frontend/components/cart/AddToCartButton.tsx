'use client';

import { useState } from 'react';
import { useCart } from '../../lib/cart';
import type { AddToCartSelection } from '../../lib/cart';
import type { Product } from '../../types/catalog';

type AddToCartButtonProps = {
  product: Product;
  selection?: AddToCartSelection;
  disabled?: boolean;
  disabledLabel?: string;
  className?: string;
};

export function AddToCartButton({
  product,
  selection,
  disabled = false,
  disabledLabel = 'Select options',
  className = '',
}: AddToCartButtonProps) {
  const { addProduct } = useCart();
  const [message, setMessage] = useState('');
  const stock = selection?.stock ?? product.stock;
  const isAvailable = product.status === 'ACTIVE' && stock > 0;
  const isDisabled = disabled || !isAvailable;

  const handleAddToCart = () => {
    const wasAdded = addProduct(product, selection);
    setMessage(wasAdded ? 'Added' : 'Unavailable');
  };

  return (
    <div className={className}>
      <button
        type="button"
        disabled={isDisabled}
        onClick={handleAddToCart}
        className="inline-flex h-11 w-full cursor-pointer items-center justify-center border border-[#111111] bg-white px-5 text-sm font-medium uppercase tracking-[0.08em] text-[#111111] transition hover:bg-[#111111] hover:text-white disabled:cursor-not-allowed disabled:border-[#d9d9d9] disabled:text-[#999999] disabled:hover:bg-white disabled:hover:text-[#999999]"
      >
        {disabled ? disabledLabel : isAvailable ? 'Add to cart' : 'Out of stock'}
      </button>
      {message && (
        <p className="mt-2 text-xs uppercase tracking-[0.14em] text-[#777777]">
          {message}
        </p>
      )}
    </div>
  );
}
