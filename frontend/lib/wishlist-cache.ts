const WISHLIST_PRODUCT_IDS_KEY = 'aevro.wishlist.productIds.v1';

export const WISHLIST_CACHE_EVENT = 'aevro:wishlist-cache-change';

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

export function readWishlistProductIds() {
  if (!canUseStorage()) {
    return new Set<string>();
  }

  try {
    const value = window.localStorage.getItem(WISHLIST_PRODUCT_IDS_KEY);
    const productIds = value ? (JSON.parse(value) as unknown) : [];

    if (!Array.isArray(productIds)) {
      return new Set<string>();
    }

    return new Set(productIds.filter((productId): productId is string => typeof productId === 'string'));
  } catch {
    return new Set<string>();
  }
}

export function writeWishlistProductIds(productIds: Iterable<string>) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(WISHLIST_PRODUCT_IDS_KEY, JSON.stringify(Array.from(productIds)));
  window.dispatchEvent(new CustomEvent(WISHLIST_CACHE_EVENT));
}

export function syncWishlistProductIds(productIds: string[]) {
  writeWishlistProductIds(productIds);
}

export function markWishlistProductSaved(productId: string) {
  const productIds = readWishlistProductIds();
  productIds.add(productId);
  writeWishlistProductIds(productIds);
}

export function markWishlistProductRemoved(productId: string) {
  const productIds = readWishlistProductIds();
  productIds.delete(productId);
  writeWishlistProductIds(productIds);
}
