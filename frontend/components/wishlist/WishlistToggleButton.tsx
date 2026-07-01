'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { AccountIcon } from '../account/AccountIcons';
import {
  addWishlistItem,
  deleteWishlistProduct,
} from '../../lib/api/wishlist';
import { useAuth } from '../../lib/auth';

type WishlistToggleButtonProps = {
  productId: string;
  variantId?: string;
  className?: string;
  label?: string;
};

export function WishlistToggleButton({
  className = '',
  label = 'Wishlist',
  productId,
  variantId,
}: WishlistToggleButtonProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { status, user } = useAuth();
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  const toggleWishlist = async () => {
    if (status === 'loading' || isSaving) {
      return;
    }

    if (!user) {
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    try {
      setIsSaving(true);
      setMessage('');

      if (isSaved) {
        await deleteWishlistProduct(productId);
        setIsSaved(false);
        setMessage('Removed');
        return;
      }

      await addWishlistItem({
        productId,
        variantId,
      });
      setIsSaved(true);
      setMessage('Saved');
    } catch {
      setMessage('Try again');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={className}>
      <button
        type="button"
        disabled={isSaving}
        onClick={toggleWishlist}
        className="inline-flex h-10 w-full items-center justify-center gap-2 border border-[#ddd4c8] bg-[#fffaf3] px-4 text-xs font-medium uppercase tracking-[0.08em] text-[#111111] transition hover:border-[#111111] disabled:cursor-not-allowed disabled:text-[#8a8177]"
        aria-pressed={isSaved}
      >
        <AccountIcon name="heart" className="h-4 w-4" />
        {isSaving ? 'Saving' : isSaved ? 'Saved' : label}
      </button>
      {message && (
        <p className="mt-2 text-xs uppercase tracking-[0.14em] text-[#777067]">
          {message}
        </p>
      )}
    </div>
  );
}
