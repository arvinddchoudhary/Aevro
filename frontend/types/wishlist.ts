import type { Product, ProductVariant } from './catalog';

export type WishlistItem = {
  id: string;
  productId: string;
  variantId: string | null;
  selectedVariant: ProductVariant | null;
  product: Product;
  createdAt: string;
  updatedAt: string;
};

export type WishlistPayload = {
  productId: string;
  variantId?: string;
};

export type WishlistItemResponse =
  | {
      success: true;
      data: WishlistItem;
    }
  | {
      success: false;
      statusCode?: number;
      message: string | string[];
    };

export type WishlistCollectionResponse =
  | {
      success: true;
      data: WishlistItem[];
    }
  | {
      success: false;
      statusCode?: number;
      message: string | string[];
    };
