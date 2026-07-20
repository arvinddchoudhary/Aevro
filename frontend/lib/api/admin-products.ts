import type { Category } from '../../types/catalog';
import type {
  AdminCollectionResponse,
  AdminItemResponse,
  AdminProduct,
  CreateAdminProductPayload,
  UploadedProductImage,
} from '../../types/admin/products';
import { authenticatedFetch } from './authenticated-request';

class AdminApiError extends Error {
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
      error?: string;
      message?: string | string[];
    };

    if (Array.isArray(body.message)) {
      return body.message.join(' ');
    }

    if (
      response.status >= 500 ||
      body.message?.toLowerCase?.().includes('internal server error')
    ) {
      return 'The server could not complete this admin request. Check backend logs, database migrations, and required environment variables.';
    }

    return body.message ?? body.error ?? 'Admin request failed.';
  } catch {
    if (response.status >= 500) {
      return 'The server could not complete this admin request. Check backend logs, database migrations, and required environment variables.';
    }

    return 'Admin request failed.';
  }
}

async function adminRequest<T>(path: string, options: RequestInit = {}) {
  const response = await authenticatedFetch(path, {
    ...options,
  });

  if (!response.ok) {
    throw new AdminApiError(await parseErrorMessage(response), response.status);
  }

  return response.json() as Promise<T>;
}

export async function getAdminCategories() {
  const response = await adminRequest<AdminCollectionResponse<Category>>(
    '/admin/categories',
  );

  if (!response.success) {
    throw new AdminApiError(
      Array.isArray(response.message) ? response.message.join(' ') : response.message,
      response.statusCode,
    );
  }

  return response.data;
}

export async function createAdminCategory(payload: {
  name: string;
  slug: string;
  description?: string;
}) {
  const response = await adminRequest<AdminItemResponse<Category>>('/admin/categories', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  if (!response.success) {
    throw new AdminApiError(
      Array.isArray(response.message) ? response.message.join(' ') : response.message,
      response.statusCode,
    );
  }

  return response.data;
}

export async function getAdminProducts() {
  const response = await adminRequest<AdminCollectionResponse<AdminProduct>>(
    '/admin/products',
  );

  if (!response.success) {
    throw new AdminApiError(
      Array.isArray(response.message) ? response.message.join(' ') : response.message,
      response.statusCode,
    );
  }

  return response.data;
}

export async function reorderAdminProducts(productIds: string[]) {
  const response = await adminRequest<AdminCollectionResponse<AdminProduct>>(
    '/admin/products/reorder',
    {
      method: 'PATCH',
      body: JSON.stringify({ productIds }),
    },
  );

  if (!response.success) {
    throw new AdminApiError(
      Array.isArray(response.message) ? response.message.join(' ') : response.message,
      response.statusCode,
    );
  }

  return response.data;
}

export async function getAdminProduct(id: string) {
  const response = await adminRequest<AdminItemResponse<AdminProduct>>(
    `/admin/products/${id}`,
  );

  if (!response.success) {
    throw new AdminApiError(
      Array.isArray(response.message) ? response.message.join(' ') : response.message,
      response.statusCode,
    );
  }

  return response.data;
}

export async function createAdminProduct(payload: CreateAdminProductPayload) {
  const response = await adminRequest<AdminItemResponse<AdminProduct>>('/admin/products', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  if (!response.success) {
    throw new AdminApiError(
      Array.isArray(response.message) ? response.message.join(' ') : response.message,
      response.statusCode,
    );
  }

  return response.data;
}

export async function updateAdminProduct(
  id: string,
  payload: CreateAdminProductPayload,
) {
  const response = await adminRequest<AdminItemResponse<AdminProduct>>(
    `/admin/products/${id}`,
    {
      method: 'PATCH',
      body: JSON.stringify(payload),
    },
  );

  if (!response.success) {
    throw new AdminApiError(
      Array.isArray(response.message) ? response.message.join(' ') : response.message,
      response.statusCode,
    );
  }

  return response.data;
}

export async function uploadProductImages(input: {
  files: File[];
  categorySlug: string;
  productSlug: string;
  colorSlug: string;
}) {
  const formData = new FormData();
  formData.set('categorySlug', input.categorySlug);
  formData.set('productSlug', input.productSlug);
  formData.set('colorSlug', input.colorSlug);
  input.files.forEach((file) => formData.append('files', file));

  const response = await adminRequest<AdminCollectionResponse<UploadedProductImage>>(
    '/admin/uploads/product-images',
    {
      method: 'POST',
      body: formData,
    },
  );

  if (!response.success) {
    throw new AdminApiError(
      Array.isArray(response.message) ? response.message.join(' ') : response.message,
      response.statusCode,
    );
  }

  return response.data;
}
