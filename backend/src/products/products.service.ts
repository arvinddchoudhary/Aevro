import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, ProductStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  ListProductsQueryDto,
  ProductSort,
} from './dto/list-products-query.dto';
import { normalizeSearchQuery, searchTerms } from './search/search-normalization';

type ProductSearchRow = {
  id: string;
  rank: number;
};

type CountRow = {
  count: bigint | number;
};

type FacetCountRow = {
  value: string;
  label: string;
  count: bigint | number;
  hex?: string | null;
};

type PriceRangeRow = {
  min: number | bigint | null;
  max: number | bigint | null;
};

type FacetContext = 'category' | 'color' | 'size' | 'price';

@Injectable()
export class ProductsService {
  private readonly lowStockThreshold = 5;

  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async listProducts(query: ListProductsQueryDto) {
    const normalizedSearch = normalizeSearchQuery(query.search);
    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 12);
    const skip = (page - 1) * limit;

    this.validatePriceRange(query);

    const [rows, totalRows, facets] = await Promise.all([
      this.findProductIds(query, normalizedSearch, skip, limit),
      this.countProducts(query, normalizedSearch),
      this.getFacets(query, normalizedSearch),
    ]);
    const total = Number(totalRows[0]?.count ?? 0);
    const productIds = rows.map((row) => row.id);
    const products = productIds.length
      ? await this.prisma.product.findMany({
          where: { id: { in: productIds } },
          select: this.productSelect(),
        })
      : [];
    const productsById = new Map(products.map((product) => [product.id, product]));
    const orderedProducts = rows
      .map((row) => productsById.get(row.id))
      .filter((product): product is (typeof products)[number] => Boolean(product));
    const pagination = {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
      hasPreviousPage: page > 1,
    };

    return {
      success: true,
      data: orderedProducts.map((product) => this.serializeProduct(product)),
      pagination,
      // Keep the legacy field for existing frontend and API consumers.
      meta: pagination,
      appliedFilters: {
        search: normalizedSearch ?? null,
        category: query.category ?? [],
        color: query.color ?? [],
        size: query.size ?? [],
        minPrice: query.minPrice ?? null,
        maxPrice: query.maxPrice ?? null,
        inStock: query.inStock ?? false,
        status: ProductStatus.ACTIVE,
        sort: query.sort ?? (normalizedSearch ? ProductSort.Relevance : ProductSort.Newest),
      },
      facets,
    };
  }

  async getSuggestions(search: string | undefined, limit = 8) {
    const normalizedSearch = normalizeSearchQuery(search);

    if (!normalizedSearch || normalizedSearch.length < 2) {
      return { success: true, data: [] };
    }

    const safeLimit = Math.min(Math.max(Number(limit) || 8, 1), 12);
    const rows = await this.prisma.$queryRaw<
      { label: string; type: string; slug: string | null; rank: number }[]
    >(Prisma.sql`
      SELECT label, type, slug, rank
      FROM (
        SELECT DISTINCT ON (d."productId")
          d."nameText" AS label,
          'product' AS type,
          p."slug" AS slug,
          (
            CASE WHEN lower(d."nameText") LIKE lower(${normalizedSearch}) || '%' THEN 100 ELSE 0 END +
            similarity(d."nameText", ${normalizedSearch}) * 30 +
            ts_rank_cd(d."searchVector", websearch_to_tsquery('simple', ${normalizedSearch})) * 20
          )::double precision AS rank
        FROM "product_search_documents" d
        JOIN "products" p ON p."id" = d."productId"
        WHERE p."status" = ${ProductStatus.ACTIVE}
          AND (
            d."searchVector" @@ websearch_to_tsquery('simple', ${normalizedSearch})
            OR d."nameText" % ${normalizedSearch}
            OR d."categoryText" % ${normalizedSearch}
          )
        ORDER BY d."productId", rank DESC
      ) suggestions
      ORDER BY rank DESC, label ASC
      LIMIT ${safeLimit}
    `);

    return {
      success: true,
      data: rows.map((row) => ({
        label: row.label,
        type: row.type,
        slug: row.slug,
      })),
    };
  }

  async getPublicProduct(identifier: string) {
    const product = await this.prisma.product.findFirst({
      where: {
        status: ProductStatus.ACTIVE,
        OR: [{ slug: identifier }, { id: identifier }],
      },
      select: this.productSelect(),
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return this.serializeProduct(product);
  }

  private async findProductIds(
    query: ListProductsQueryDto,
    normalizedSearch: string | undefined,
    skip: number,
    limit: number,
  ) {
    const conditions = this.buildSqlConditions(query, normalizedSearch);
    const from = this.productFromSql();
    const rank = this.rankSql(normalizedSearch);
    const orderBy = this.orderBySql(query.sort, Boolean(normalizedSearch));

    return this.prisma.$queryRaw<ProductSearchRow[]>(Prisma.sql`
      SELECT p."id", ${rank} AS rank
      ${from}
      WHERE ${Prisma.join(conditions, ' AND ')}
      ORDER BY ${orderBy}
      LIMIT ${limit} OFFSET ${skip}
    `);
  }

  private async countProducts(
    query: ListProductsQueryDto,
    normalizedSearch: string | undefined,
  ) {
    const conditions = this.buildSqlConditions(query, normalizedSearch);

    return this.prisma.$queryRaw<CountRow[]>(Prisma.sql`
      SELECT COUNT(DISTINCT p."id")::int AS count
      ${this.productFromSql()}
      WHERE ${Prisma.join(conditions, ' AND ')}
    `);
  }

  private async getFacets(
    query: ListProductsQueryDto,
    normalizedSearch: string | undefined,
  ) {
    const [categories, colors, sizes, priceRange] = await Promise.all([
      this.getCategoryFacets(query, normalizedSearch),
      this.getColorFacets(query, normalizedSearch),
      this.getSizeFacets(query, normalizedSearch),
      this.getPriceRange(query, normalizedSearch),
    ]);

    return {
      categories: categories.map((facet) => ({
        value: facet.value,
        label: facet.label,
        count: Number(facet.count),
      })),
      colors: colors.map((facet) => ({
        value: facet.value,
        label: facet.label,
        count: Number(facet.count),
        hex: facet.hex ?? null,
      })),
      sizes: sizes.map((facet) => ({
        value: facet.value,
        label: facet.label,
        count: Number(facet.count),
      })),
      fits: [],
      styles: [],
      materials: [],
      priceRange: {
        min: priceRange[0]?.min === null || priceRange[0]?.min === undefined
          ? null
          : Math.round(Number(priceRange[0].min) / 100),
        max: priceRange[0]?.max === null || priceRange[0]?.max === undefined
          ? null
          : Math.round(Number(priceRange[0].max) / 100),
      },
    };
  }

  private async getCategoryFacets(query: ListProductsQueryDto, normalizedSearch?: string) {
    const conditions = this.buildSqlConditions(query, normalizedSearch, 'category');

    return this.prisma.$queryRaw<FacetCountRow[]>(Prisma.sql`
      SELECT c."slug" AS value, c."name" AS label, COUNT(DISTINCT p."id")::int AS count
      ${this.productFromSql()}
      WHERE ${Prisma.join(conditions, ' AND ')} AND c."id" IS NOT NULL
      GROUP BY c."slug", c."name"
      ORDER BY c."name" ASC
    `);
  }

  private async getColorFacets(query: ListProductsQueryDto, normalizedSearch?: string) {
    const conditions = this.buildSqlConditions(query, normalizedSearch, 'color');

    return this.prisma.$queryRaw<FacetCountRow[]>(Prisma.sql`
      SELECT v."colorSlug" AS value,
        MAX(v."colorName") AS label,
        MAX(v."colorHex") AS hex,
        COUNT(DISTINCT p."id")::int AS count
      ${this.productFromSql()}
      JOIN "product_variants" v ON v."productId" = p."id"
      WHERE ${Prisma.join(conditions, ' AND ')}
      GROUP BY v."colorSlug"
      ORDER BY label ASC
    `);
  }

  private async getSizeFacets(query: ListProductsQueryDto, normalizedSearch?: string) {
    const conditions = this.buildSqlConditions(query, normalizedSearch, 'size');

    return this.prisma.$queryRaw<FacetCountRow[]>(Prisma.sql`
      SELECT v."size" AS value, v."size" AS label, COUNT(DISTINCT p."id")::int AS count
      ${this.productFromSql()}
      JOIN "product_variants" v ON v."productId" = p."id"
      WHERE ${Prisma.join(conditions, ' AND ')}
      GROUP BY v."size"
      ORDER BY v."size" ASC
    `);
  }

  private async getPriceRange(query: ListProductsQueryDto, normalizedSearch?: string) {
    const conditions = this.buildSqlConditions(query, normalizedSearch, 'price');

    return this.prisma.$queryRaw<PriceRangeRow[]>(Prisma.sql`
      SELECT MIN(p."priceInPaise")::int AS min, MAX(p."priceInPaise")::int AS max
      ${this.productFromSql()}
      WHERE ${Prisma.join(conditions, ' AND ')}
    `);
  }

  private buildSqlConditions(
    query: ListProductsQueryDto,
    normalizedSearch: string | undefined,
    excludedFacet?: FacetContext,
  ) {
    const conditions: Prisma.Sql[] = [
      // The public catalog must never expose draft or archived products.
      Prisma.sql`p."status" = ${ProductStatus.ACTIVE}`,
    ];

    if (query.category?.length && excludedFacet !== 'category') {
      conditions.push(Prisma.sql`c."slug" IN (${Prisma.join(query.category)})`);
    }

    if (query.color?.length && excludedFacet !== 'color') {
      conditions.push(Prisma.sql`
        EXISTS (
          SELECT 1 FROM "product_variants" vc
          WHERE vc."productId" = p."id"
            AND vc."colorSlug" IN (${Prisma.join(query.color)})
        )
      `);
    }

    if (query.size?.length && excludedFacet !== 'size') {
      conditions.push(Prisma.sql`
        EXISTS (
          SELECT 1 FROM "product_variants" vs
          WHERE vs."productId" = p."id"
            AND vs."size" IN (${Prisma.join(query.size)})
        )
      `);
    }

    if (query.inStock) {
      conditions.push(Prisma.sql`
        (
          p."stock" > 0 OR EXISTS (
            SELECT 1 FROM "product_variants" vi
            WHERE vi."productId" = p."id" AND vi."stock" > 0
          )
        )
      `);
    }

    const minPrice = query.minPrice === undefined ? undefined : this.toPriceInPaise(query.minPrice);
    const maxPrice = query.maxPrice === undefined ? undefined : this.toPriceInPaise(query.maxPrice);

    if (minPrice !== undefined && excludedFacet !== 'price') {
      conditions.push(Prisma.sql`p."priceInPaise" >= ${minPrice}`);
    }

    if (maxPrice !== undefined && excludedFacet !== 'price') {
      conditions.push(Prisma.sql`p."priceInPaise" <= ${maxPrice}`);
    }

    if (normalizedSearch) {
      conditions.push(Prisma.sql`
        (
          d."searchVector" @@ websearch_to_tsquery('simple', ${normalizedSearch})
          OR d."nameText" % ${normalizedSearch}
          OR d."categoryText" % ${normalizedSearch}
          OR d."attributeText" % ${normalizedSearch}
          OR d."descriptionText" % ${normalizedSearch}
          OR d."searchText" ILIKE ${`%${normalizedSearch}%`}
        )
      `);
    }

    return conditions;
  }

  private productFromSql() {
    return Prisma.sql`
      FROM "products" p
      LEFT JOIN "categories" c ON c."id" = p."categoryId"
      LEFT JOIN "product_search_documents" d ON d."productId" = p."id"
    `;
  }

  private rankSql(normalizedSearch?: string) {
    if (!normalizedSearch) {
      return Prisma.sql`0::double precision`;
    }

    const termScores = searchTerms(normalizedSearch).map(
      (term) => Prisma.sql`CASE WHEN d."searchText" ILIKE ${`%${term}%`} THEN 8 ELSE 0 END`,
    );
    const termScore = termScores.length
      ? Prisma.sql`+ ${Prisma.join(termScores, ' + ')}`
      : Prisma.sql``;

    return Prisma.sql`(
      CASE WHEN lower(d."nameText") = lower(${normalizedSearch}) THEN 100 ELSE 0 END +
      CASE WHEN lower(d."nameText") LIKE lower(${normalizedSearch}) || '%' THEN 50 ELSE 0 END +
      CASE WHEN lower(d."categoryText") = lower(${normalizedSearch}) THEN 40 ELSE 0 END +
      ts_rank_cd(d."searchVector", websearch_to_tsquery('simple', ${normalizedSearch})) * 20 +
      GREATEST(
        similarity(d."nameText", ${normalizedSearch}) * 30,
        similarity(d."categoryText", ${normalizedSearch}) * 22,
        similarity(d."attributeText", ${normalizedSearch}) * 16,
        similarity(d."descriptionText", ${normalizedSearch}) * 8
      )
      ${termScore}
    )::double precision`;
  }

  private orderBySql(sort: ProductSort | undefined, hasSearch: boolean) {
    if (hasSearch && (sort === undefined || sort === ProductSort.Relevance)) {
      return Prisma.sql`rank DESC, p."createdAt" DESC, p."id" ASC`;
    }

    if (sort === ProductSort.PriceAsc) {
      return Prisma.sql`p."priceInPaise" ASC, p."createdAt" DESC, p."id" ASC`;
    }

    if (sort === ProductSort.PriceDesc) {
      return Prisma.sql`p."priceInPaise" DESC, p."createdAt" DESC, p."id" ASC`;
    }

    return Prisma.sql`p."createdAt" DESC, p."id" ASC`;
  }

  private validatePriceRange(query: ListProductsQueryDto) {
    if (
      query.minPrice !== undefined &&
      query.maxPrice !== undefined &&
      query.minPrice > query.maxPrice
    ) {
      throw new BadRequestException('minPrice must be less than or equal to maxPrice.');
    }
  }

  private toPriceInPaise(priceInRupees: number) {
    return Math.round(priceInRupees * 100);
  }

  private productSelect() {
    return {
      id: true,
      name: true,
      slug: true,
      description: true,
      priceInPaise: true,
      sku: true,
      color: true,
      size: true,
      stock: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      images: {
        orderBy: { sortOrder: 'asc' as const },
        select: {
          id: true,
          url: true,
          altText: true,
          sortOrder: true,
          isPrimary: true,
          variantId: true,
        },
      },
      variants: {
        orderBy: [{ colorSlug: 'asc' as const }, { size: 'asc' as const }],
        select: {
          id: true,
          colorName: true,
          colorSlug: true,
          colorHex: true,
          size: true,
          stock: true,
          images: {
            orderBy: { sortOrder: 'asc' as const },
            select: {
              id: true,
              url: true,
              altText: true,
              sortOrder: true,
              isPrimary: true,
              variantId: true,
            },
          },
        },
      },
    } satisfies Prisma.ProductSelect;
  }

  private serializeProduct(product: Prisma.ProductGetPayload<{
    select: ReturnType<ProductsService['productSelect']>;
  }>) {
    const variants = product.variants.map((variant) => ({
      id: variant.id,
      colorName: variant.colorName,
      colorSlug: variant.colorSlug,
      colorHex: variant.colorHex,
      size: variant.size,
      stock: variant.stock,
      lowStock: variant.stock > 0 && variant.stock <= this.lowStockThreshold,
      images: variant.images,
    }));
    const variantImages = variants.flatMap((variant) => variant.images);
    const primaryImage =
      variantImages.find((image) => image.isPrimary) ??
      product.images.find((image) => image.isPrimary) ??
      variantImages[0] ??
      product.images[0] ??
      null;
    const colors = new Map<
      string,
      {
        colorName: string;
        colorSlug: string;
        colorHex: string | null;
        totalStock: number;
        lowStock: boolean;
      }
    >();
    const sizesByColor: Record<string, { variantId: string; size: string; stock: number; lowStock: boolean }[]> = {};
    const imagesByColor: Record<string, typeof product.images> = {};

    variants.forEach((variant) => {
      const existingColor = colors.get(variant.colorSlug);
      const totalStock = (existingColor?.totalStock ?? 0) + variant.stock;

      colors.set(variant.colorSlug, {
        colorName: variant.colorName,
        colorSlug: variant.colorSlug,
        colorHex: variant.colorHex,
        totalStock,
        lowStock: totalStock > 0 && totalStock <= this.lowStockThreshold,
      });
      sizesByColor[variant.colorSlug] = [
        ...(sizesByColor[variant.colorSlug] ?? []),
        {
          variantId: variant.id,
          size: variant.size,
          stock: variant.stock,
          lowStock: variant.stock > 0 && variant.stock <= this.lowStockThreshold,
        },
      ];
      imagesByColor[variant.colorSlug] = [
        ...(imagesByColor[variant.colorSlug] ?? []),
        ...variant.images,
      ];
    });

    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      priceInPaise: product.priceInPaise,
      sku: product.sku,
      color: product.color,
      size: product.size,
      stock: product.stock,
      lowStock: product.stock > 0 && product.stock <= this.lowStockThreshold,
      status: product.status,
      category: product.category,
      images: product.images,
      primaryImage,
      availableColors: Array.from(colors.values()),
      sizesByColor,
      imagesByColor,
      variants,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }
}
