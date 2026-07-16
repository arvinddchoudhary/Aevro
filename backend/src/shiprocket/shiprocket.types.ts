import { ShipmentStatus } from '@prisma/client';

export type JsonRecord = Record<string, unknown>;

export type ShiprocketOrderItem = {
  name: string;
  sku: string;
  units: number;
  selling_price: number;
  discount: number;
  tax: number;
  hsn: string;
};

export type ShiprocketCreateOrderPayload = {
  order_id: string;
  order_date: string;
  pickup_location: string;
  billing_customer_name: string;
  billing_last_name: string;
  billing_address: string;
  billing_address_2: string;
  billing_city: string;
  billing_pincode: string;
  billing_state: string;
  billing_country: string;
  billing_email: string;
  billing_phone: string;
  shipping_is_billing: boolean;
  order_items: ShiprocketOrderItem[];
  payment_method: 'Prepaid';
  shipping_charges: number;
  giftwrap_charges: number;
  transaction_charges: number;
  total_discount: number;
  sub_total: number;
  length: number;
  breadth: number;
  height: number;
  weight: number;
};

export type ShiprocketCourierRate = {
  courierCompanyId: number;
  courierName: string;
  rateInPaise: number | null;
  estimatedDeliveryDays: number | null;
  etd: string | null;
  mode: string | null;
};

export type ShiprocketTrackingEvent = {
  status: ShipmentStatus;
  statusLabel: string;
  occurredAt: string | null;
  activity: string | null;
  location: string | null;
};

export type NormalizedShiprocketTracking = {
  status: ShipmentStatus;
  statusLabel: string;
  awbCode: string | null;
  courierCompanyName: string | null;
  trackingUrl: string | null;
  estimatedDeliveryDate: Date | null;
  events: ShiprocketTrackingEvent[];
  providerResponse: JsonRecord;
};

export class ShiprocketProviderError extends Error {
  constructor(
    message: string,
    readonly statusCode?: number,
    readonly safeDetails?: JsonRecord,
  ) {
    super(message);
    this.name = 'ShiprocketProviderError';
  }
}
