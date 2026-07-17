export type ProductStatus = 'DRAFT' | 'ACTIVE' | 'ARCHIVED';
export type ProductSort =
  | 'relevance'
  | 'featured'
  | 'newest'
  | 'price_asc'
  | 'price_desc';

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
  isPrimary?: boolean;
  variantId?: string | null;
};

export type ProductVariant = {
  id: string;
  colorName: string;
  colorSlug: string;
  colorHex: string | null;
  size: string;
  stock: number;
  lowStock?: boolean;
  sku?: string | null;
  images: ProductImage[];
};

export type ProductColorOption = {
  colorName: string;
  colorSlug: string;
  colorHex: string | null;
  totalStock: number;
  lowStock?: boolean;
};

export type ProductSizeOption = {
  variantId: string;
  size: string;
  stock: number;
  lowStock?: boolean;
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  priceInPaise: number;
  sku?: string | null;
  color: string | null;
  size: string | null;
  stock: number;
  lowStock?: boolean;
  status: ProductStatus;
  category: Pick<Category, 'id' | 'name' | 'slug'> | null;
  images: ProductImage[];
  primaryImage?: ProductImage | null;
  availableColors?: ProductColorOption[];
  sizesByColor?: Record<string, ProductSizeOption[]>;
  imagesByColor?: Record<string, ProductImage[]>;
  variants?: ProductVariant[];
  createdAt: string;
  updatedAt: string;
};

export type ProductListQuery = {
  page?: number;
  limit?: number;
  category?: string | string[];
  search?: string;
  color?: string | string[];
  size?: string | string[];
  status?: ProductStatus;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  sort?: ProductSort;
};

export type FacetOption = {
  value: string;
  label: string;
  count: number;
  hex?: string | null;
};

export type ProductFacets = {
  categories: FacetOption[];
  colors: FacetOption[];
  sizes: FacetOption[];
  fits: FacetOption[];
  styles: FacetOption[];
  materials: FacetOption[];
  priceRange: {
    min: number | null;
    max: number | null;
  };
};

export type AppliedProductFilters = {
  search: string | null;
  category: string[];
  color: string[];
  size: string[];
  minPrice: number | null;
  maxPrice: number | null;
  inStock: boolean;
  status: ProductStatus;
  sort: ProductSort;
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
  pagination?: PaginationMeta;
  appliedFilters?: AppliedProductFilters;
  facets?: ProductFacets;
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
