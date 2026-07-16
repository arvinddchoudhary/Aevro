import { OrderStatus, ShipmentStatus } from '@prisma/client';

const statusByCode: Record<number, ShipmentStatus> = {
  1: ShipmentStatus.AWB_ASSIGNED,
  2: ShipmentStatus.AWB_ASSIGNED,
  3: ShipmentStatus.PICKUP_SCHEDULED,
  4: ShipmentStatus.PICKUP_SCHEDULED,
  5: ShipmentStatus.PICKUP_SCHEDULED,
  6: ShipmentStatus.IN_TRANSIT,
  7: ShipmentStatus.DELIVERED,
  8: ShipmentStatus.CANCELLED,
  9: ShipmentStatus.RTO_INITIATED,
  10: ShipmentStatus.RTO_DELIVERED,
  11: ShipmentStatus.CREATED,
  12: ShipmentStatus.UNDELIVERED,
  13: ShipmentStatus.FAILED,
  14: ShipmentStatus.RTO_INITIATED,
  15: ShipmentStatus.PICKUP_SCHEDULED,
  16: ShipmentStatus.CANCELLED,
  17: ShipmentStatus.OUT_FOR_DELIVERY,
  18: ShipmentStatus.IN_TRANSIT,
  19: ShipmentStatus.PICKUP_SCHEDULED,
  20: ShipmentStatus.FAILED,
  21: ShipmentStatus.UNDELIVERED,
  22: ShipmentStatus.IN_TRANSIT,
  23: ShipmentStatus.UNDELIVERED,
  24: ShipmentStatus.UNDELIVERED,
  25: ShipmentStatus.UNDELIVERED,
  26: ShipmentStatus.DELIVERED,
  27: ShipmentStatus.PICKUP_SCHEDULED,
  38: ShipmentStatus.IN_TRANSIT,
  39: ShipmentStatus.IN_TRANSIT,
  40: ShipmentStatus.RTO_INITIATED,
  41: ShipmentStatus.RTO_INITIATED,
  42: ShipmentStatus.PICKED_UP,
  43: ShipmentStatus.DELIVERED,
  44: ShipmentStatus.RTO_DELIVERED,
  45: ShipmentStatus.CANCELLED,
  46: ShipmentStatus.RTO_INITIATED,
  47: ShipmentStatus.UNDELIVERED,
  48: ShipmentStatus.IN_TRANSIT,
  49: ShipmentStatus.IN_TRANSIT,
  50: ShipmentStatus.IN_TRANSIT,
  51: ShipmentStatus.IN_TRANSIT,
  52: ShipmentStatus.CREATED,
  54: ShipmentStatus.IN_TRANSIT,
  55: ShipmentStatus.IN_TRANSIT,
  56: ShipmentStatus.IN_TRANSIT,
  57: ShipmentStatus.IN_TRANSIT,
  59: ShipmentStatus.CREATED,
  60: ShipmentStatus.CREATED,
  61: ShipmentStatus.CREATED,
  62: ShipmentStatus.CREATED,
  63: ShipmentStatus.CREATED,
  67: ShipmentStatus.PICKUP_SCHEDULED,
  68: ShipmentStatus.CREATED,
  71: ShipmentStatus.FAILED,
  72: ShipmentStatus.FAILED,
  75: ShipmentStatus.RTO_INITIATED,
  76: ShipmentStatus.UNDELIVERED,
  77: ShipmentStatus.UNDELIVERED,
  78: ShipmentStatus.RTO_INITIATED,
};

const SHIPPED_SHIPMENT_STATUSES = new Set<ShipmentStatus>([
  ShipmentStatus.PICKED_UP,
  ShipmentStatus.IN_TRANSIT,
  ShipmentStatus.OUT_FOR_DELIVERY,
]);
const SHIPPABLE_ORDER_STATUSES = new Set<OrderStatus>([
  OrderStatus.CONFIRMED,
  OrderStatus.PROCESSING,
]);
const PROCESSING_SHIPMENT_STATUSES = new Set<ShipmentStatus>([
  ShipmentStatus.CREATED,
  ShipmentStatus.AWB_ASSIGNED,
  ShipmentStatus.PICKUP_SCHEDULED,
]);

export function mapShiprocketStatus(
  statusCode: number | null,
  statusLabel?: string | null,
): ShipmentStatus {
  if (statusCode !== null && statusByCode[statusCode]) {
    return statusByCode[statusCode];
  }

  const normalized = statusLabel?.trim().toUpperCase().replace(/[\s-]+/g, '_') ?? '';

  if (normalized.includes('OUT_FOR_DELIVERY')) return ShipmentStatus.OUT_FOR_DELIVERY;
  if (normalized.includes('DELIVERED') && !normalized.includes('RTO')) return ShipmentStatus.DELIVERED;
  if (normalized.includes('RTO_DELIVERED')) return ShipmentStatus.RTO_DELIVERED;
  if (normalized.includes('RTO')) return ShipmentStatus.RTO_INITIATED;
  if (normalized.includes('CANCEL')) return ShipmentStatus.CANCELLED;
  if (normalized.includes('UNDELIVERED') || normalized.includes('LOST')) {
    return ShipmentStatus.UNDELIVERED;
  }
  if (normalized.includes('PICKED_UP')) return ShipmentStatus.PICKED_UP;
  if (normalized.includes('IN_TRANSIT') || normalized.includes('SHIPPED')) {
    return ShipmentStatus.IN_TRANSIT;
  }
  if (normalized.includes('PICKUP')) return ShipmentStatus.PICKUP_SCHEDULED;
  if (normalized.includes('AWB')) return ShipmentStatus.AWB_ASSIGNED;
  if (normalized.includes('ERROR') || normalized.includes('EXCEPTION')) {
    return ShipmentStatus.FAILED;
  }

  return ShipmentStatus.CREATED;
}

export function orderStatusForShipment(
  shipmentStatus: ShipmentStatus,
  currentOrderStatus: OrderStatus,
): OrderStatus | null {
  if (currentOrderStatus === OrderStatus.CANCELLED) {
    return null;
  }

  if (shipmentStatus === ShipmentStatus.DELIVERED) {
    return currentOrderStatus === OrderStatus.DELIVERED ? null : OrderStatus.DELIVERED;
  }

  if (
    SHIPPED_SHIPMENT_STATUSES.has(shipmentStatus) &&
    SHIPPABLE_ORDER_STATUSES.has(currentOrderStatus)
  ) {
    return OrderStatus.SHIPPED;
  }

  if (
    PROCESSING_SHIPMENT_STATUSES.has(shipmentStatus) &&
    currentOrderStatus === OrderStatus.CONFIRMED
  ) {
    return OrderStatus.PROCESSING;
  }

  return null;
}
