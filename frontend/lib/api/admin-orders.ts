import type {
  AdminOrder,
  AdminOrderResponse,
  AdminOrdersQuery,
  AdminOrdersResponse,
  AdminOrderStatus,
} from '../../types/admin/orders';
import type {
  AdminShipment,
  AdminShipmentState,
  CreateShipmentPayload,
  ShiprocketCourierRate,
  ShipmentReview,
} from '../../types/shipping';
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

type ShipmentResponse<T> = {
  success: true;
  data: T;
};

function shipmentPath(id: string, suffix = '') {
  return `/admin/orders/${encodeURIComponent(id)}/shipment${suffix}`;
}

export async function getAdminShipment(id: string) {
  const response = await adminOrderRequest<ShipmentResponse<AdminShipmentState>>(
    shipmentPath(id),
  );
  return response.data;
}

export async function getShiprocketRates(id: string) {
  const response = await adminOrderRequest<ShipmentResponse<ShiprocketCourierRate[]>>(
    shipmentPath(id, '/shiprocket/rates'),
  );
  return response.data;
}

export async function getShiprocketReview(id: string) {
  const response = await adminOrderRequest<ShipmentResponse<ShipmentReview>>(
    shipmentPath(id, '/shiprocket/review'),
  );
  return response.data;
}

async function shipmentMutation(
  id: string,
  action: string,
  body?: Record<string, unknown>,
) {
  const response = await adminOrderRequest<ShipmentResponse<AdminShipment>>(
    shipmentPath(id, `/shiprocket/${action}`),
    {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    },
  );
  return response.data;
}

export function createShiprocketShipment(id: string, payload: CreateShipmentPayload) {
  return shipmentMutation(id, 'create', payload);
}

export function assignShiprocketAwb(id: string, courierId: number) {
  return shipmentMutation(id, 'assign-awb', { courierId });
}

export function scheduleShiprocketPickup(id: string, pickupDate?: string) {
  return shipmentMutation(id, 'pickup', pickupDate ? { pickupDate } : {});
}

export function cancelShiprocketShipment(id: string) {
  return shipmentMutation(id, 'cancel');
}

export function refreshShiprocketTracking(id: string) {
  return shipmentMutation(id, 'refresh-tracking');
}
