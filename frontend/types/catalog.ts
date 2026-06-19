export type ProductStatus = 'DRAFT' | 'ACTIVE' | 'ARCHIVED';
export type ProductSort = 'newest' | 'price_asc' | 'price_desc';

export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  activeProductCount?: number;
};

export type ProductImage = {
  id: string;
  url: string;
  altText: string | null;
  sortOrder: number;
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  priceInPaise: number;
  sku: string | null;
  color: string | null;
  size: string | null;
  stock: number;
  status: ProductStatus;
  category: Pick<Category, 'id' | 'name' | 'slug'> | null;
  images: ProductImage[];
  createdAt: string;
  updatedAt: string;
};

export type ProductListQuery = {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  status?: ProductStatus;
  minPrice?: number;
  maxPrice?: number;
  sort?: ProductSort;
};

export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

export type ApiCollectionResponse<T> = {
  success: true;
  data: T[];
  meta?: PaginationMeta;
};

export type ApiItemResponse<T> =
  | {
      success: true;
      data: T;
    }
  | {
      success: false;
      statusCode?: number;
      message: string;
    };
