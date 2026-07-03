import type {
  WishlistCollectionResponse,
  WishlistItem,
  WishlistItemResponse,
  WishlistPayload,
} from '../../types/wishlist';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1';

export class WishlistApiError extends Error {
  constructor(
    message: string,
    readonly statusCode?: number,
  ) {
    super(message);
  }
}

async function parseErrorMessage(response: Response) {
  try {
    const body = (await response.json()) as {
      detail?: string | string[];
      error?: string | string[];
      message?: string | string[];
    };
    const message = body.message ?? body.detail ?? body.error;

    if (Array.isArray(message)) {
      return message.join(' ');
    }

    return message ?? 'Wishlist request failed.';
  } catch {
    return 'Wishlist request failed.';
  }
}

async function wishlistRequest<T>(path: string, options: RequestInit = {}) {
  const headers = new Headers(options.headers);

  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    cache: 'no-store',
    credentials: 'include',
    headers,
  });

  if (!response.ok) {
    throw new WishlistApiError(await parseErrorMessage(response), response.status);
  }

  return (await response.json()) as T;
}

function assertItemSuccess(response: WishlistItemResponse) {
  if (!response.success) {
    throw new WishlistApiError(
      Array.isArray(response.message) ? response.message.join(' ') : response.message,
      response.statusCode,
    );
  }

  return response.data;
}

function assertCollectionSuccess(response: WishlistCollectionResponse) {
  if (!response.success) {
    throw new WishlistApiError(
      Array.isArray(response.message) ? response.message.join(' ') : response.message,
      response.statusCode,
    );
  }

  return response.data;
}

export async function getWishlist() {
  return assertCollectionSuccess(
    await wishlistRequest<WishlistCollectionResponse>('/users/me/wishlist', {
      method: 'GET',
    }),
  );
}

export async function addWishlistItem(payload: WishlistPayload) {
  return assertItemSuccess(
    await wishlistRequest<WishlistItemResponse>('/users/me/wishlist', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  );
}

export async function deleteWishlistItem(id: string) {
  await wishlistRequest<{ success: true; data: { id: string } }>(
    `/users/me/wishlist/${encodeURIComponent(id)}`,
    {
      method: 'DELETE',
    },
  );
}

export async function deleteWishlistProduct(productId: string) {
  await wishlistRequest<{ success: true; data: { productId: string } }>(
    `/users/me/wishlist/product/${encodeURIComponent(productId)}`,
    {
      method: 'DELETE',
    },
  );
}
