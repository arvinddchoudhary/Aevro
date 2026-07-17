CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE TABLE "product_search_documents" (
  "id" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  "nameText" TEXT NOT NULL,
  "slugText" TEXT NOT NULL,
  "skuText" TEXT,
  "categoryText" TEXT,
  "attributeText" TEXT,
  "descriptionText" TEXT,
  "searchText" TEXT NOT NULL,
  "searchVector" tsvector NOT NULL DEFAULT ''::tsvector,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "product_search_documents_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "product_search_documents_productId_key"
  ON "product_search_documents"("productId");

CREATE INDEX "product_search_documents_searchVector_gin"
  ON "product_search_documents" USING GIN ("searchVector");

CREATE INDEX "product_search_documents_searchText_trgm_gin"
  ON "product_search_documents" USING GIN ("searchText" gin_trgm_ops);

CREATE INDEX "product_search_documents_nameText_trgm_gin"
  ON "product_search_documents" USING GIN ("nameText" gin_trgm_ops);

CREATE INDEX "product_search_documents_categoryText_trgm_gin"
  ON "product_search_documents" USING GIN ("categoryText" gin_trgm_ops);

CREATE INDEX "product_variants_size_idx" ON "product_variants"("size");

INSERT INTO "product_search_documents" (
  "id",
  "productId",
  "nameText",
  "slugText",
  "skuText",
  "categoryText",
  "attributeText",
  "descriptionText",
  "searchText",
  "searchVector",
  "updatedAt"
)
SELECT
  'search_' || p."id",
  p."id",
  p."name",
  p."slug",
  p."sku",
  CASE WHEN c."id" IS NULL THEN NULL ELSE c."name" || ' ' || c."slug" END,
  NULLIF(string_agg(
    concat_ws(' ', v."colorName", v."colorSlug", v."size", v."sku"),
    ' '
  ), ''),
  p."description",
  concat_ws(' ',
    p."name",
    p."slug",
    p."sku",
    CASE WHEN c."id" IS NULL THEN NULL ELSE c."name" || ' ' || c."slug" END,
    NULLIF(string_agg(
      concat_ws(' ', v."colorName", v."colorSlug", v."size", v."sku"),
      ' '
    ), ''),
    p."description"
  ),
  setweight(to_tsvector('simple', coalesce(p."name", '')), 'A') ||
  setweight(to_tsvector('simple', coalesce(p."slug", '')), 'A') ||
  setweight(to_tsvector('simple', coalesce(p."sku", '')), 'A') ||
  setweight(to_tsvector('simple', coalesce(c."name" || ' ' || c."slug", '')), 'A') ||
  setweight(to_tsvector('simple', coalesce(string_agg(
    concat_ws(' ', v."colorName", v."colorSlug", v."size", v."sku"),
    ' '
  ), '')), 'B') ||
  setweight(to_tsvector('simple', coalesce(p."description", '')), 'C'),
  CURRENT_TIMESTAMP
FROM "products" p
LEFT JOIN "categories" c ON c."id" = p."categoryId"
LEFT JOIN "product_variants" v ON v."productId" = p."id"
GROUP BY p."id", p."name", p."slug", p."sku", p."description", c."id", c."name", c."slug";

ALTER TABLE "product_search_documents"
  ADD CONSTRAINT "product_search_documents_productId_fkey"
  FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
