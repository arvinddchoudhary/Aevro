'use client';

import Link from 'next/link';
import { useCart } from '../../lib/cart';

export function CartNavLink() {
  const { itemCount } = useCart();

  return (
    <Link href="/cart" className="underline-offset-8 hover:underline">
      Bag ({itemCount})
    </Link>
  );
}
