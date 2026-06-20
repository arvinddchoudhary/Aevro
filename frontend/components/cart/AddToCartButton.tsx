'use client';

import { useState } from 'react';
import { useCart } from '../../lib/cart';
import type { Product } from '../../types/catalog';

type AddToCartButtonProps = {
  product: Product;
  className?: string;
};

export function AddToCartButton({
  product,
  className = '',
}: AddToCartButtonProps) {
  const { addProduct } = useCart();
  const [message, setMessage] = useState('');
  const isAvailable = product.status === 'ACTIVE' && product.stock > 0;

  const handleAddToCart = () => {
    const wasAdded = addProduct(product);
    setMessage(wasAdded ? 'Added' : 'Unavailable');
  };

  return (
    <div className={className}>
      <button
        type="button"
        disabled={!isAvailable}
        onClick={handleAddToCart}
        className="inline-flex h-11 w-full items-center justify-center border border-[#111111] bg-white px-5 text-sm font-medium uppercase tracking-[0.08em] text-[#111111] transition hover:bg-[#111111] hover:text-white disabled:cursor-not-allowed disabled:border-[#d9d9d9] disabled:text-[#999999] disabled:hover:bg-white disabled:hover:text-[#999999]"
      >
        {isAvailable ? 'Add to cart' : 'Out of stock'}
      </button>
      {message && (
        <p className="mt-2 text-xs uppercase tracking-[0.14em] text-[#777777]">
          {message}
        </p>
      )}
    </div>
  );
}
