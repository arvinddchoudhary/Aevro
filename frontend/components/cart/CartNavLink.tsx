'use client';

import Link from 'next/link';
import { useCart } from '../../lib/cart';

export function CartNavLink() {
  const { itemCount } = useCart();

  return (
    <Link
      href="/cart"
      className="relative flex items-center justify-center p-1"
      aria-label={`Bag with ${itemCount} item${itemCount === 1 ? '' : 's'}`}
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
        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
        <path d="M3 6h18" />
        <path d="M16 10a4 4 0 0 1-8 0" />
      </svg>
      {itemCount > 0 && (
        <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#111111] px-1 text-[9px] font-semibold text-white">
          {itemCount}
        </span>
      )}
    </Link>
  );
}
