import type {
  ApiCollectionResponse,
  ApiItemResponse,
  Category,
  Product,
  ProductListQuery,
} from '../../types/catalog';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1';

type RequestOptions = {
  params?: Record<string, string | string[] | number | boolean | undefined>;
  signal?: AbortSignal;
};

class ApiError extends Error {
  constructor(
    message: string,
    readonly statusCode?: number,
  ) {
    super(message);
  }
}

function buildUrl(path: string, params?: RequestOptions['params']) {
  const url = new URL(`${API_URL}${path}`);

  Object.entries(params ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      const normalized = Array.isArray(value) ? value.filter(Boolean).join(',') : String(value);

      if (normalized) {
        url.searchParams.set(key, normalized);
      }
    }
  });

  return url;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const response = await fetch(buildUrl(path, options.params), {
    cache: 'no-store',
    signal: options.signal,
  });

  if (!response.ok) {
    throw new ApiError(`API request failed: ${path}`, response.status);
  }

  return response.json() as Promise<T>;
}

export async function getCategories(options?: { includeEmpty?: boolean }) {
  const response = await request<ApiCollectionResponse<Category>>('/categories', {
    params: options,
  });

  return response.data;
}

export async function getProducts(
  query: ProductListQuery = {},
  options?: { signal?: AbortSignal },
) {
  return request<ApiCollectionResponse<Product>>('/products', {
    params: query,
    signal: options?.signal,
  });
}

export async function getProductSuggestions(
  query: string,
  options?: { limit?: number; signal?: AbortSignal },
) {
  return request<{
    success: true;
    data: { label: string; type: string; slug: string | null }[];
  }>('/products/suggestions', {
    params: { q: query, limit: options?.limit },
    signal: options?.signal,
  });
}

export async function getProduct(identifier: string): Promise<ApiItemResponse<Product>> {
  try {
    return await request<ApiItemResponse<Product>>(
      `/products/${encodeURIComponent(identifier)}`,
    );
  } catch (error) {
    if (error instanceof ApiError) {
      return {
        success: false,
        statusCode: error.statusCode,
        message: error.message,
      };
    }

    return {
      success: false,
      message: 'Unable to load product',
    };
  }
}
