import type {
  CreateOrderPayload,
  OrderResponse,
  OrdersResponse,
} from '../../types/orders';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1';

class OrdersApiError extends Error {
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

    return body.message ?? 'Order request failed.';
  } catch {
    return 'Order request failed.';
  }
}

export async function createOrder(payload: CreateOrderPayload) {
  const response = await fetch(`${API_URL}/orders`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new OrdersApiError(await parseErrorMessage(response), response.status);
  }

  const orderResponse = (await response.json()) as OrderResponse;

  if (!orderResponse.success) {
    throw new OrdersApiError(
      Array.isArray(orderResponse.message)
        ? orderResponse.message.join(' ')
        : orderResponse.message,
      orderResponse.statusCode,
    );
  }

  return orderResponse.data;
}

export async function getMyOrders(): Promise<OrdersResponse> {
  try {
    const response = await fetch(`${API_URL}/orders/me`, {
      cache: 'no-store',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new OrdersApiError(await parseErrorMessage(response), response.status);
    }

    return (await response.json()) as OrdersResponse;
  } catch (error) {
    if (error instanceof OrdersApiError) {
      return {
        success: false,
        statusCode: error.statusCode,
        message: error.message,
      };
    }

    return {
      success: false,
      message: 'Unable to load orders.',
    };
  }
}

export async function getMyOrder(id: string): Promise<OrderResponse> {
  try {
    const response = await fetch(`${API_URL}/orders/me/${encodeURIComponent(id)}`, {
      cache: 'no-store',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new OrdersApiError(await parseErrorMessage(response), response.status);
    }

    return (await response.json()) as OrderResponse;
  } catch (error) {
    if (error instanceof OrdersApiError) {
      return {
        success: false,
        statusCode: error.statusCode,
        message: error.message,
      };
    }

    return {
      success: false,
      message: 'Unable to load order.',
    };
  }
}

export async function getOrder(id: string): Promise<OrderResponse> {
  try {
    const response = await fetch(`${API_URL}/orders/${encodeURIComponent(id)}`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new OrdersApiError(await parseErrorMessage(response), response.status);
    }

    return (await response.json()) as OrderResponse;
  } catch (error) {
    if (error instanceof OrdersApiError) {
      return {
        success: false,
        statusCode: error.statusCode,
        message: error.message,
      };
    }

    return {
      success: false,
      message: 'Unable to load order.',
    };
  }
}
