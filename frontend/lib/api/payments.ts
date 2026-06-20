import type {
  ApiPaymentResponse,
  Payment,
  PaymentVerificationPayload,
  RazorpayOrder,
} from '../../types/payments';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1';

class PaymentsApiError extends Error {
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

    return body.message ?? 'Payment request failed.';
  } catch {
    return 'Payment request failed.';
  }
}

async function postPaymentRequest<T>(path: string, body: unknown) {
  const response = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new PaymentsApiError(await parseErrorMessage(response), response.status);
  }

  const payload = (await response.json()) as ApiPaymentResponse<T>;

  if (!payload.success) {
    throw new PaymentsApiError(
      Array.isArray(payload.message) ? payload.message.join(' ') : payload.message,
      payload.statusCode,
    );
  }

  return payload.data;
}

export function createRazorpayOrder(orderId: string) {
  return postPaymentRequest<RazorpayOrder>('/payments/razorpay/order', {
    orderId,
  });
}

export function verifyRazorpayPayment(payload: PaymentVerificationPayload) {
  return postPaymentRequest<Payment>('/payments/razorpay/verify', payload);
}
