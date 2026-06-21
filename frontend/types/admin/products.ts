import type { Category } from '../catalog';

export type AdminProductStatus = 'DRAFT' | 'ACTIVE' | 'ARCHIVED';

export type UploadedProductImage = {
  url: string;
  publicId?: string | null;
  altText?: string;
  sortOrder: number;
  isPrimary: boolean;
};

export type AdminProductImage = UploadedProductImage & {
  id?: string;
  altText?: string | null;
  variantId?: string | null;
};

export type AdminProductVariantInput = {
  colorName: string;
  colorSlug: string;
  colorHex?: string;
  size: string;
  stock: number;
  sku?: string;
  images: UploadedProductImage[];
};

export type CreateAdminProductPayload = {
  name: string;
  slug: string;
  description?: string;
  priceInPaise: number;
  categoryId: string;
  status: AdminProductStatus;
  variants: AdminProductVariantInput[];
};

export type AdminProduct = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  priceInPaise: number;
  status: AdminProductStatus;
  category: Category | null;
  primaryImage: AdminProductImage | null;
  stock: number;
  createdAt: string;
  updatedAt: string;
  variants: Array<{
    id: string;
    colorName: string;
    colorSlug: string;
    colorHex: string | null;
    size: string;
    stock: number;
    sku: string | null;
    images: AdminProductImage[];
  }>;
};

export type AdminCollectionResponse<T> =
  | {
      success: true;
      data: T[];
    }
  | {
      success: false;
      statusCode?: number;
      message: string | string[];
    };

export type AdminItemResponse<T> =
  | {
      success: true;
      data: T;
    }
  | {
      success: false;
      statusCode?: number;
      message: string | string[];
    };
