'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AccountIcon } from '../account/AccountIcons';
import {
  addWishlistItem,
  deleteWishlistItem,
  deleteWishlistProduct,
} from '../../lib/api/wishlist';
import { useAuth } from '../../lib/auth';
import {
  markWishlistProductRemoved,
  markWishlistProductSaved,
  readWishlistProductIds,
  WISHLIST_CACHE_EVENT,
} from '../../lib/wishlist-cache';

type WishlistToggleButtonProps = {
  productId: string;
  variantId?: string;
  className?: string;
  initialSaved?: boolean;
  initialWishlistItemId?: string | null;
  label?: string;
  variant?: 'button' | 'icon';
};

export function WishlistToggleButton({
  className = '',
  initialSaved,
  initialWishlistItemId = null,
  label = 'Wishlist',
  productId,
  variant = 'button',
  variantId,
}: WishlistToggleButtonProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { status, user } = useAuth();
  const [isSaved, setIsSaved] = useState(initialSaved ?? false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedItemId, setSavedItemId] = useState<string | null>(initialWishlistItemId);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (initialSaved !== undefined) {
      setIsSaved(initialSaved);
      setSavedItemId(initialWishlistItemId);
      return;
    }

    const syncSavedState = () => {
      setIsSaved(readWishlistProductIds().has(productId));
    };

    syncSavedState();
    window.addEventListener(WISHLIST_CACHE_EVENT, syncSavedState);
    window.addEventListener('storage', syncSavedState);

    return () => {
      window.removeEventListener(WISHLIST_CACHE_EVENT, syncSavedState);
      window.removeEventListener('storage', syncSavedState);
    };
  }, [initialSaved, initialWishlistItemId, productId]);

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
        if (savedItemId) {
          try {
            await deleteWishlistItem(savedItemId);
          } catch {
            await deleteWishlistProduct(productId);
          }
        } else {
          await deleteWishlistProduct(productId);
        }
        setIsSaved(false);
        setSavedItemId(null);
        markWishlistProductRemoved(productId);
        setMessage('Removed');
        return;
      }

      const item = await addWishlistItem({
        productId,
        variantId,
      });
      setIsSaved(true);
      setSavedItemId(item.id);
      markWishlistProductSaved(productId);
      setMessage('Added to wishlist');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Try again');
    } finally {
      setIsSaving(false);
    }
  };

  if (variant === 'icon') {
    return (
      <div className={className}>
        <button
          type="button"
          disabled={isSaving}
          onClick={toggleWishlist}
          className={`inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#ddd4c8] bg-[#fffaf3]/95 text-[#111111] shadow-[0_10px_24px_rgba(49,37,26,0.08)] transition hover:border-[#111111] hover:bg-white disabled:cursor-not-allowed disabled:opacity-70 ${
            isSaved ? 'border-[#b42318] text-[#d21f1f]' : ''
          }`}
          aria-label={isSaved ? 'Remove from wishlist' : 'Add to wishlist'}
          aria-pressed={isSaved}
        >
          <AccountIcon
            name="heart"
            className={`h-5 w-5 ${isSaved ? 'fill-current text-[#d21f1f]' : ''}`}
          />
        </button>
        {message && (
          <p className="pointer-events-none absolute right-0 top-12 whitespace-nowrap rounded-full border border-[#ddd4c8] bg-[#fffaf3] px-3 py-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-[#514c45] shadow-[0_12px_28px_rgba(49,37,26,0.1)]">
            {message}
          </p>
        )}
      </div>
    );
  }

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
