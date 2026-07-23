import { buildApiUrl } from './base-url';

export type DeliveryEstimate = {
  source: 'SHIPROCKET' | 'STANDARD';
  estimatedDeliveryStartDate: string | null;
  estimatedDeliveryEndDate: string | null;
  estimatedDeliveryDays: number | null;
  message: string;
};

type DeliveryEstimateItem = {
  productId: string;
  variantId?: string;
  quantity: number;
};

export async function getCheckoutDeliveryEstimate(
  postalCode: string,
  items: DeliveryEstimateItem[],
): Promise<DeliveryEstimate> {
  const response = await fetch(buildApiUrl('/checkout/delivery-estimate'), {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ postalCode, items }),
  });

  if (!response.ok) {
    throw new Error('Unable to load a delivery estimate.');
  }

  const payload = (await response.json()) as { success?: boolean; data?: DeliveryEstimate };
  if (!payload.success || !payload.data) {
    throw new Error('Unable to load a delivery estimate.');
  }

  return payload.data;
}
