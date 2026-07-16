CREATE TYPE "ShipmentProvider" AS ENUM ('SHIPROCKET');

CREATE TYPE "ShipmentStatus" AS ENUM (
  'PENDING',
  'CREATED',
  'AWB_ASSIGNED',
  'PICKUP_SCHEDULED',
  'PICKED_UP',
  'IN_TRANSIT',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
  'UNDELIVERED',
  'RTO_INITIATED',
  'RTO_DELIVERED',
  'CANCELLED',
  'FAILED'
);

CREATE TABLE "shipments" (
  "id" TEXT NOT NULL,
  "orderId" TEXT NOT NULL,
  "provider" "ShipmentProvider" NOT NULL DEFAULT 'SHIPROCKET',
  "providerOrderId" TEXT,
  "providerShipmentId" TEXT,
  "awbCode" TEXT,
  "courierCompanyId" TEXT,
  "courierCompanyName" TEXT,
  "pickupLocation" TEXT NOT NULL,
  "trackingUrl" TEXT,
  "status" "ShipmentStatus" NOT NULL DEFAULT 'PENDING',
  "statusLabel" TEXT,
  "statusHistory" JSONB NOT NULL DEFAULT '[]',
  "weightKg" DOUBLE PRECISION NOT NULL,
  "lengthCm" DOUBLE PRECISION NOT NULL,
  "breadthCm" DOUBLE PRECISION NOT NULL,
  "heightCm" DOUBLE PRECISION NOT NULL,
  "shippingChargeInPaise" INTEGER,
  "estimatedDeliveryDate" TIMESTAMP(3),
  "pickupScheduledAt" TIMESTAMP(3),
  "shippedAt" TIMESTAMP(3),
  "deliveredAt" TIMESTAMP(3),
  "cancelledAt" TIMESTAMP(3),
  "lastSyncedAt" TIMESTAMP(3),
  "rawProviderResponse" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "shipments_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "shipment_webhook_events" (
  "id" TEXT NOT NULL,
  "shipmentId" TEXT,
  "provider" "ShipmentProvider" NOT NULL DEFAULT 'SHIPROCKET',
  "eventKey" TEXT NOT NULL,
  "eventType" TEXT NOT NULL,
  "payload" JSONB NOT NULL,
  "status" "WebhookEventStatus" NOT NULL DEFAULT 'RECEIVED',
  "processedAt" TIMESTAMP(3),
  "errorMessage" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "shipment_webhook_events_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "shipments_orderId_key" ON "shipments"("orderId");
CREATE UNIQUE INDEX "shipments_providerOrderId_key" ON "shipments"("providerOrderId");
CREATE UNIQUE INDEX "shipments_providerShipmentId_key" ON "shipments"("providerShipmentId");
CREATE UNIQUE INDEX "shipments_awbCode_key" ON "shipments"("awbCode");
CREATE INDEX "shipments_provider_status_idx" ON "shipments"("provider", "status");
CREATE INDEX "shipments_lastSyncedAt_idx" ON "shipments"("lastSyncedAt");
CREATE UNIQUE INDEX "shipment_webhook_events_eventKey_key" ON "shipment_webhook_events"("eventKey");
CREATE INDEX "shipment_webhook_events_shipmentId_idx" ON "shipment_webhook_events"("shipmentId");
CREATE INDEX "shipment_webhook_events_provider_eventType_idx" ON "shipment_webhook_events"("provider", "eventType");
CREATE INDEX "shipment_webhook_events_status_idx" ON "shipment_webhook_events"("status");

ALTER TABLE "shipments"
  ADD CONSTRAINT "shipments_orderId_fkey"
  FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "shipment_webhook_events"
  ADD CONSTRAINT "shipment_webhook_events_shipmentId_fkey"
  FOREIGN KEY ("shipmentId") REFERENCES "shipments"("id") ON DELETE SET NULL ON UPDATE CASCADE;
