CREATE TYPE "HomepageSectionType" AS ENUM ('HERO', 'FEATURED_COLLECTION', 'FEATURED_PRODUCTS', 'LOOKBOOK', 'CAMPAIGN_BANNER');

CREATE TABLE "homepage_sections" (
  "id" TEXT NOT NULL,
  "type" "HomepageSectionType" NOT NULL,
  "title" TEXT,
  "subtitle" TEXT,
  "description" TEXT,
  "imageUrl" TEXT,
  "imagePublicId" TEXT,
  "ctaLabel" TEXT,
  "ctaHref" TEXT,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "metadata" JSONB DEFAULT '{}',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "homepage_sections_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "homepage_sections_isActive_sortOrder_idx" ON "homepage_sections"("isActive", "sortOrder");
CREATE INDEX "homepage_sections_type_isActive_idx" ON "homepage_sections"("type", "isActive");
