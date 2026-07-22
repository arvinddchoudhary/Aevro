'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useCart } from '../../lib/cart';
import type { AddToCartSelection } from '../../lib/cart';
import type { Product } from '../../types/catalog';

type AddToCartButtonProps = {
  product: Product;
  selection?: AddToCartSelection;
  disabled?: boolean;
  disabledLabel?: string;
  className?: string;
  added?: boolean;
  onAdded?: () => void;
  showAddedMessage?: boolean;
};

export function AddToCartButton({
  product,
  selection,
  disabled = false,
  disabledLabel = 'Select options',
  className = '',
  added = false,
  onAdded,
  showAddedMessage = true,
}: AddToCartButtonProps) {
  const { addProduct } = useCart();
  const [message, setMessage] = useState('');
  const stock = selection?.stock ?? product.stock;
  const isAvailable = product.status === 'ACTIVE' && stock > 0;
  const isDisabled = disabled || !isAvailable;

  const handleAddToCart = () => {
    const wasAdded = addProduct(product, selection);

    if (wasAdded && onAdded) {
      onAdded();
      return;
    }

    setMessage(wasAdded ? 'Added' : 'Unavailable');
  };

  return (
    <div className={className}>
      {added ? (
        <Link
          href="/cart"
          className="inline-flex h-11 w-full cursor-pointer items-center justify-center bg-[#111111] px-5 text-xs font-medium uppercase tracking-[0.08em] text-[#fffaf3] transition hover:bg-[#2a2825]"
          style={{ color: '#fffaf3' }}
        >
          Go to bag
        </Link>
      ) : (
        <button
          type="button"
          disabled={isDisabled}
          onClick={handleAddToCart}
          className="inline-flex h-11 w-full cursor-pointer items-center justify-center bg-[#111111] px-5 text-xs font-medium uppercase tracking-[0.08em] transition hover:bg-[#2a2825] disabled:cursor-not-allowed disabled:border disabled:border-[#ddd4c8] disabled:bg-transparent disabled:text-[#999999]"
          style={{ color: isDisabled ? undefined : '#fffaf3' }}
        >
          {disabled ? disabledLabel : isAvailable ? 'Add to bag' : 'Out of stock'}
        </button>
      )}
      {(added && showAddedMessage ? 'Added' : message) && (
        <p className="mt-2 text-xs uppercase tracking-[0.14em] text-[#777777]">
          {added && showAddedMessage ? 'Added' : message}
        </p>
      )}
    </div>
  );
}
