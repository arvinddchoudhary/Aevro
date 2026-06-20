'use client';

import { useCart } from '../../lib/cart';

type CartQuantityControlsProps = {
  productId: string;
  quantity: number;
  stock: number;
};

export function CartQuantityControls({
  productId,
  quantity,
  stock,
}: CartQuantityControlsProps) {
  const { decrementItem, incrementItem, removeItem } = useCart();

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="inline-flex h-10 items-center border border-[#d9d9d9]">
        <button
          type="button"
          onClick={() => decrementItem(productId)}
          className="h-full w-10 text-lg"
          aria-label="Decrease quantity"
        >
          -
        </button>
        <span className="min-w-10 text-center text-sm">{quantity}</span>
        <button
          type="button"
          onClick={() => incrementItem(productId)}
          disabled={quantity >= stock}
          className="h-full w-10 text-lg disabled:cursor-not-allowed disabled:text-[#bbbbbb]"
          aria-label="Increase quantity"
        >
          +
        </button>
      </div>
      <button
        type="button"
        onClick={() => removeItem(productId)}
        className="text-sm underline underline-offset-4"
      >
        Remove
      </button>
    </div>
  );
}
