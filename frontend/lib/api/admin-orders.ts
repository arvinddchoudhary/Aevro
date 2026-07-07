import type {
  AdminOrder,
  AdminOrderResponse,
  AdminOrdersQuery,
  AdminOrdersResponse,
  AdminOrderStatus,
} from '../../types/admin/orders';
import { authenticatedFetch } from './authenticated-request';

class AdminOrdersApiError extends Error {
  constructor(
    message: string,
    readonly statusCode?: number,
  ) {
    super(message);
  }
}

async function parseErrorMessage(response: Response) {
  try {
    const body = (await response.json()) as { message?: string | string[] };

    if (Array.isArray(body.message)) {
      return body.message.join(' ');
    }

    return body.message ?? 'Admin order request failed.';
  } catch {
    return 'Admin order request failed.';
  }
}

function buildQueryString(query: AdminOrdersQuery) {
  const params = new URLSearchParams();

  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      params.set(key, String(value));
    }
  });

  const queryString = params.toString();

  return queryString ? `?${queryString}` : '';
}

async function adminOrderRequest<T>(path: string, options: RequestInit = {}) {
  const response = await authenticatedFetch(path, {
    ...options,
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new AdminOrdersApiError(
      await parseErrorMessage(response),
      response.status,
    );
  }

  return response.json() as Promise<T>;
}

export async function getAdminOrders(query: AdminOrdersQuery = {}) {
  const response = await adminOrderRequest<AdminOrdersResponse>(
    `/admin/orders${buildQueryString(query)}`,
  );

  if (!response.success) {
    throw new AdminOrdersApiError(
      Array.isArray(response.message) ? response.message.join(' ') : response.message,
      response.statusCode,
    );
  }

  return response;
}

export async function getAdminOrder(id: string) {
  const response = await adminOrderRequest<AdminOrderResponse>(
    `/admin/orders/${encodeURIComponent(id)}`,
  );

  if (!response.success) {
    throw new AdminOrdersApiError(
      Array.isArray(response.message) ? response.message.join(' ') : response.message,
      response.statusCode,
    );
  }

  return response.data;
}

export async function updateAdminOrderStatus(
  id: string,
  status: AdminOrderStatus,
): Promise<AdminOrder> {
  const response = await adminOrderRequest<AdminOrderResponse>(
    `/admin/orders/${encodeURIComponent(id)}/status`,
    {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    },
  );

  if (!response.success) {
    throw new AdminOrdersApiError(
      Array.isArray(response.message) ? response.message.join(' ') : response.message,
      response.statusCode,
    );
  }

  return response.data;
}
