import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, ProductStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  ListProductsQueryDto,
  ProductSort,
} from './dto/list-products-query.dto';

@Injectable()
export class ProductsService {
  private readonly lowStockThreshold = 5;

  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async listProducts(query: ListProductsQueryDto) {
    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 12);
    const skip = (page - 1) * limit;
    const where = this.buildProductWhere(query);
    const orderBy = this.buildProductOrderBy(query.sort ?? ProductSort.Newest);

    const products = await this.prisma.product.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      select: this.productSelect(),
    });
    const total = await this.prisma.product.count({ where });

    return {
      success: true,
      data: products.map((product) => this.serializeProduct(product)),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPreviousPage: page > 1,
      },
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

  private buildProductWhere(query: ListProductsQueryDto): Prisma.ProductWhereInput {
    const and: Prisma.ProductWhereInput[] = [
      {
        status: query.status ?? ProductStatus.ACTIVE,
      },
    ];

    if (query.category) {
      and.push({
        category: {
          slug: query.category,
        },
      });
    }

    if (query.search) {
      and.push({
        OR: [
          {
            name: {
              contains: query.search,
              mode: 'insensitive',
            },
          },
          {
            description: {
              contains: query.search,
              mode: 'insensitive',
            },
          },
          {
            sku: {
              contains: query.search,
              mode: 'insensitive',
            },
          },
        ],
      });
    }

    if (query.color) {
      and.push({
        variants: {
          some: {
            colorSlug: query.color,
          },
        },
      });
    }

    if (query.size) {
      and.push({
        variants: {
          some: {
            size: query.size,
          },
        },
      });
    }

    const minPrice =
      query.minPrice === undefined ? undefined : Number(query.minPrice);
    const maxPrice =
      query.maxPrice === undefined ? undefined : Number(query.maxPrice);

    if (minPrice !== undefined || maxPrice !== undefined) {
      and.push({
        priceInPaise: {
          gte: minPrice,
          lte: maxPrice,
        },
      });
    }

    return {
      AND: and,
    };
  }

  private buildProductOrderBy(sort: ProductSort): Prisma.ProductOrderByWithRelationInput {
    if (sort === ProductSort.PriceAsc) {
      return { priceInPaise: 'asc' };
    }

    if (sort === ProductSort.PriceDesc) {
      return { priceInPaise: 'desc' };
    }

    return { createdAt: 'desc' };
  }

  private productSelect() {
    return {
      id: true,
      name: true,
      slug: true,
      description: true,
      priceInPaise: true,
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
        orderBy: {
          sortOrder: 'asc',
        },
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
        orderBy: [{ colorSlug: 'asc' }, { size: 'asc' }],
        select: {
          id: true,
          colorName: true,
          colorSlug: true,
          colorHex: true,
          size: true,
          stock: true,
          images: {
            orderBy: {
              sortOrder: 'asc',
            },
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
    const sizesByColor: Record<
      string,
      {
        variantId: string;
        size: string;
        stock: number;
        lowStock: boolean;
      }[]
    > = {};
    const imagesByColor: Record<string, typeof product.images> = {};

    variants.forEach((variant) => {
      const existingColor = colors.get(variant.colorSlug);

      colors.set(variant.colorSlug, {
        colorName: variant.colorName,
        colorSlug: variant.colorSlug,
        colorHex: variant.colorHex,
        totalStock: (existingColor?.totalStock ?? 0) + variant.stock,
        lowStock:
          ((existingColor?.totalStock ?? 0) + variant.stock) > 0 &&
          ((existingColor?.totalStock ?? 0) + variant.stock) <=
            this.lowStockThreshold,
      });

      sizesByColor[variant.colorSlug] = [
        ...(sizesByColor[variant.colorSlug] ?? []),
        {
          variantId: variant.id,
          size: variant.size,
          stock: variant.stock,
          lowStock: variant.lowStock,
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
