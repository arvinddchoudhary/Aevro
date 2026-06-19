import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, ProductStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  ListProductsQueryDto,
  ProductSort,
} from './dto/list-products-query.dto';

@Injectable()
export class ProductsService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async listProducts(query: ListProductsQueryDto) {
    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 12);
    const skip = (page - 1) * limit;
    const where = this.buildProductWhere(query);
    const orderBy = this.buildProductOrderBy(query.sort ?? ProductSort.Newest);

    const [products, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        select: this.productSelect(),
      }),
      this.prisma.product.count({ where }),
    ]);

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
        orderBy: {
          sortOrder: 'asc',
        },
        select: {
          id: true,
          url: true,
          altText: true,
          sortOrder: true,
        },
      },
    } satisfies Prisma.ProductSelect;
  }

  private serializeProduct(product: Prisma.ProductGetPayload<{
    select: ReturnType<ProductsService['productSelect']>;
  }>) {
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
      status: product.status,
      category: product.category,
      images: product.images,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }
}
