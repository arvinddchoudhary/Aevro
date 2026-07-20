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
  pickupPincode: string | null;
  trackingUrl: string | null;
  status: ShipmentStatus;
  statusLabel: string | null;
  statusHistory: ShipmentTimelineEvent[];
  weightKg: number;
  lengthCm: number;
  breadthCm: number;
  heightCm: number;
  packageType: 'SMALL' | 'LARGE' | 'MANUAL' | null;
  recommendedWeightKg: number | null;
  recommendedLengthCm: number | null;
  recommendedBreadthCm: number | null;
  recommendedHeightCm: number | null;
  packageReviewedAt: string | null;
  packageReviewedByAdminId: string | null;
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

export type ShipmentReview = {
  orderId: string;
  orderNumber: string;
  paymentStatus: 'PAID';
  orderStatus: 'CONFIRMED';
  customer: {
    name: string;
    email: string;
    phone: string;
    shippingAddress: {
      addressLine1: string;
      addressLine2: string | null;
      city: string;
      state: string;
      pincode: string;
      country: string;
    };
  };
  items: Array<{
    name: string;
    sku: string;
    size: string | null;
    color: string | null;
    quantity: number;
    unitPriceInPaise: number;
  }>;
  totalQuantity: number;
  recommendation: {
    packageType: 'SMALL' | 'LARGE' | 'MANUAL';
    weightKg: number | null;
    lengthCm: number | null;
    breadthCm: number | null;
    heightCm: number | null;
    requiresManualDetails: boolean;
  };
  pickupLocations: Array<{ name: string; pincode: string }>;
  defaultPickupLocation: string;
};

export type CreateShipmentPayload = {
  pickupLocation: string;
  packageType: 'SMALL' | 'LARGE' | 'MANUAL';
  weightKg: number;
  lengthCm: number;
  breadthCm: number;
  heightCm: number;
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
