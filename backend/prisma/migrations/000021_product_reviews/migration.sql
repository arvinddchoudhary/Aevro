CREATE TYPE "ProductReviewStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'HIDDEN');
CREATE TYPE "ProductReviewFitFeedback" AS ENUM ('RUNS_SMALL', 'TRUE_TO_SIZE', 'RUNS_LARGE');

CREATE TABLE "product_reviews" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  "orderId" TEXT NOT NULL,
  "orderItemId" TEXT NOT NULL,
  "rating" INTEGER NOT NULL,
  "title" VARCHAR(100),
  "body" TEXT NOT NULL,
  "fitFeedback" "ProductReviewFitFeedback",
  "purchasedSize" TEXT,
  "purchasedColor" TEXT,
  "verifiedPurchase" BOOLEAN NOT NULL DEFAULT true,
  "status" "ProductReviewStatus" NOT NULL DEFAULT 'PENDING',
  "moderatedById" TEXT,
  "moderatedAt" TIMESTAMP(3),
  "moderationReason" VARCHAR(500),
  "deletedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "product_reviews_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "product_review_images" (
  "id" TEXT NOT NULL,
  "reviewId" TEXT NOT NULL,
  "url" TEXT NOT NULL,
  "publicId" TEXT NOT NULL,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "deletedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "product_review_images_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "product_review_moderation_events" (
  "id" TEXT NOT NULL,
  "reviewId" TEXT NOT NULL,
  "moderatorId" TEXT,
  "previousStatus" "ProductReviewStatus",
  "newStatus" "ProductReviewStatus",
  "reason" VARCHAR(500),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "product_review_moderation_events_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "product_reviews_userId_productId_key" ON "product_reviews"("userId", "productId");
CREATE UNIQUE INDEX "product_reviews_orderItemId_key" ON "product_reviews"("orderItemId");
CREATE INDEX "product_reviews_productId_status_createdAt_idx" ON "product_reviews"("productId", "status", "createdAt");
CREATE INDEX "product_reviews_userId_createdAt_idx" ON "product_reviews"("userId", "createdAt");
CREATE INDEX "product_reviews_status_createdAt_idx" ON "product_reviews"("status", "createdAt");
CREATE INDEX "product_reviews_orderId_idx" ON "product_reviews"("orderId");
CREATE INDEX "product_reviews_rating_idx" ON "product_reviews"("rating");
CREATE UNIQUE INDEX "product_review_images_publicId_key" ON "product_review_images"("publicId");
CREATE INDEX "product_review_images_reviewId_sortOrder_idx" ON "product_review_images"("reviewId", "sortOrder");
CREATE INDEX "product_review_moderation_events_reviewId_createdAt_idx" ON "product_review_moderation_events"("reviewId", "createdAt");
CREATE INDEX "product_review_moderation_events_moderatorId_createdAt_idx" ON "product_review_moderation_events"("moderatorId", "createdAt");

ALTER TABLE "product_reviews" ADD CONSTRAINT "product_reviews_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "product_reviews" ADD CONSTRAINT "product_reviews_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "product_reviews" ADD CONSTRAINT "product_reviews_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "product_reviews" ADD CONSTRAINT "product_reviews_orderItemId_fkey" FOREIGN KEY ("orderItemId") REFERENCES "order_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "product_reviews" ADD CONSTRAINT "product_reviews_moderatedById_fkey" FOREIGN KEY ("moderatedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "product_review_images" ADD CONSTRAINT "product_review_images_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "product_reviews"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "product_review_moderation_events" ADD CONSTRAINT "product_review_moderation_events_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "product_reviews"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "product_review_moderation_events" ADD CONSTRAINT "product_review_moderation_events_moderatorId_fkey" FOREIGN KEY ("moderatorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
