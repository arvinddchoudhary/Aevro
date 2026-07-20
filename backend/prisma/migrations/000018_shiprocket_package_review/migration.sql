CREATE TYPE "ShipmentPackageType" AS ENUM ('SMALL', 'LARGE', 'MANUAL');

ALTER TABLE "shipments"
  ADD COLUMN "pickupPincode" TEXT,
  ADD COLUMN "packageType" "ShipmentPackageType",
  ADD COLUMN "recommendedWeightKg" DOUBLE PRECISION,
  ADD COLUMN "recommendedLengthCm" DOUBLE PRECISION,
  ADD COLUMN "recommendedBreadthCm" DOUBLE PRECISION,
  ADD COLUMN "recommendedHeightCm" DOUBLE PRECISION,
  ADD COLUMN "packageReviewedAt" TIMESTAMP(3),
  ADD COLUMN "packageReviewedByAdminId" TEXT;
