export type ShipmentStatus =
  | 'PENDING'
  | 'CREATED'
  | 'AWB_ASSIGNED'
  | 'PICKUP_SCHEDULED'
  | 'PICKED_UP'
  | 'IN_TRANSIT'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'UNDELIVERED'
  | 'RTO_INITIATED'
  | 'RTO_DELIVERED'
  | 'CANCELLED'
  | 'FAILED';

export type ShipmentTimelineEvent = {
  status: ShipmentStatus;
  statusLabel: string;
  occurredAt: string | null;
  activity: string | null;
  location: string | null;
};

export type AdminShipment = {
  id: string;
  provider: 'SHIPROCKET';
  providerOrderId: string | null;
  providerShipmentId: string | null;
  awbCode: string | null;
  courierCompanyId: string | null;
  courierCompanyName: string | null;
  pickupLocation: string;
  trackingUrl: string | null;
  status: ShipmentStatus;
  statusLabel: string | null;
  statusHistory: ShipmentTimelineEvent[];
  weightKg: number;
  lengthCm: number;
  breadthCm: number;
  heightCm: number;
  shippingChargeInPaise: number | null;
  estimatedDeliveryDate: string | null;
  pickupScheduledAt: string | null;
  shippedAt: string | null;
  deliveredAt: string | null;
  cancelledAt: string | null;
  lastSyncedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AdminShipmentState = {
  enabled: boolean;
  shipment: AdminShipment | null;
};

export type ShiprocketCourierRate = {
  courierCompanyId: number;
  courierName: string;
  rateInPaise: number | null;
  estimatedDeliveryDays: number | null;
  etd: string | null;
  mode: string | null;
};

export type OrderTracking = {
  status: ShipmentStatus;
  statusLabel: string | null;
  awbCode: string | null;
  courierCompanyName: string | null;
  trackingUrl: string | null;
  estimatedDeliveryDate: string | null;
  timeline: ShipmentTimelineEvent[];
};

