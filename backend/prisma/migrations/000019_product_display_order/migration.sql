-- Add a durable, admin-managed storefront product position.
-- Existing products retain position zero and therefore preserve their current
-- created-at ordering until an administrator saves a catalog arrangement.
ALTER TABLE "products" ADD COLUMN "displayOrder" INTEGER NOT NULL DEFAULT 0;

CREATE INDEX "products_status_displayOrder_idx" ON "products"("status", "displayOrder");
