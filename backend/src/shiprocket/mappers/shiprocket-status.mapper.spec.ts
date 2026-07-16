import assert from 'node:assert/strict';
import test from 'node:test';
import { OrderStatus, ShipmentStatus } from '@prisma/client';
import { mapShiprocketStatus, orderStatusForShipment } from './shiprocket-status.mapper';

test('maps Shiprocket lifecycle statuses to internal shipment statuses', () => {
  assert.equal(mapShiprocketStatus(42), ShipmentStatus.PICKED_UP);
  assert.equal(mapShiprocketStatus(6), ShipmentStatus.IN_TRANSIT);
  assert.equal(mapShiprocketStatus(17), ShipmentStatus.OUT_FOR_DELIVERY);
  assert.equal(mapShiprocketStatus(7), ShipmentStatus.DELIVERED);
  assert.equal(mapShiprocketStatus(null, 'RTO Initiated'), ShipmentStatus.RTO_INITIATED);
});

test('advances simple order status without cancelling or refunding an order', () => {
  assert.equal(
    orderStatusForShipment(ShipmentStatus.CREATED, OrderStatus.CONFIRMED),
    OrderStatus.PROCESSING,
  );
  assert.equal(
    orderStatusForShipment(ShipmentStatus.IN_TRANSIT, OrderStatus.PROCESSING),
    OrderStatus.SHIPPED,
  );
  assert.equal(
    orderStatusForShipment(ShipmentStatus.DELIVERED, OrderStatus.SHIPPED),
    OrderStatus.DELIVERED,
  );
  assert.equal(
    orderStatusForShipment(ShipmentStatus.RTO_INITIATED, OrderStatus.SHIPPED),
    null,
  );
  assert.equal(
    orderStatusForShipment(ShipmentStatus.CANCELLED, OrderStatus.PROCESSING),
    null,
  );
});

test('does not revive a cancelled order from a shipment webhook', () => {
  assert.equal(
    orderStatusForShipment(ShipmentStatus.DELIVERED, OrderStatus.CANCELLED),
    null,
  );
});

