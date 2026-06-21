import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAdminCategoryDto } from './dto/admin-category.dto';
import {
  AdminProductVariantDto,
  CreateAdminProductDto,
  UpdateAdminProductDto,
  UpdateAdminProductStatusDto,
} from './dto/admin-product.dto';

@Injectable()
export class AdminProductsService {
  private readonly lowStockThreshold = 5;

  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async listCategories() {
    return this.prisma.category.findMany({
      orderBy: {
        name: 'asc',
      },
    });
  }

  async createCategory(dto: CreateAdminCategoryDto) {
    return this.prisma.category.create({
      data: {
        name: dto.name.trim(),
        slug: dto.slug.trim(),
        description: dto.description?.trim(),
      },
    });
  }

  async listProducts() {
    const products = await this.prisma.product.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      include: this.productInclude(),
    });

    return products.map((product) => this.serializeProduct(product));
  }

  async createProduct(dto: CreateAdminProductDto) {
    const firstVariant = dto.variants[0];
    const totalStock = dto.variants.reduce((total, variant) => total + variant.stock, 0);

    const product = await this.prisma.$transaction(async (tx) => {
      const createdProduct = await tx.product.create({
        data: {
          name: dto.name.trim(),
          slug: dto.slug.trim(),
          description: dto.description?.trim(),
          priceInPaise: dto.priceInPaise,
          categoryId: dto.categoryId,
          status: dto.status,
          color: firstVariant.colorName,
          size: firstVariant.size,
          sku: firstVariant.sku,
          stock: totalStock,
        },
      });

      await this.createVariants(tx, createdProduct.id, dto.variants);

      return this.findProductOrThrow(tx, createdProduct.id);
    });

    return this.serializeProduct(product);
  }

  async getProduct(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: this.productInclude(),
    });

    if (!product) {
      throw new NotFoundException('Product not found.');
    }

    return this.serializeProduct(product);
  }

  async updateProduct(id: string, dto: UpdateAdminProductDto) {
    await this.ensureProductExists(id);
    const variantData = dto.variants;
    const firstVariant = variantData?.[0];
    const totalStock = variantData?.reduce((total, variant) => total + variant.stock, 0);

    await this.prisma.$transaction(async (tx) => {
      await tx.product.update({
        where: { id },
        data: {
          name: dto.name?.trim(),
          slug: dto.slug?.trim(),
          description: dto.description?.trim(),
          priceInPaise: dto.priceInPaise,
          categoryId: dto.categoryId,
          status: dto.status,
          color: firstVariant?.colorName,
          size: firstVariant?.size,
          sku: firstVariant?.sku,
          stock: totalStock,
        },
      });

      if (variantData) {
        await tx.productVariant.deleteMany({
          where: { productId: id },
        });
        await this.createVariants(tx, id, variantData);
      }

    }, {
      maxWait: 10000,
      timeout: 20000,
    });

    const product = await this.prisma.product.findUnique({
      where: { id },
      include: this.productInclude(),
    });

    if (!product) {
      throw new NotFoundException('Product not found.');
    }

    return this.serializeProduct(product);
  }

  async updateProductStatus(id: string, dto: UpdateAdminProductStatusDto) {
    await this.ensureProductExists(id);
    const product = await this.prisma.product.update({
      where: { id },
      data: {
        status: dto.status,
      },
      include: this.productInclude(),
    });

    return this.serializeProduct(product);
  }

  private async ensureProductExists(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!product) {
      throw new NotFoundException('Product not found.');
    }
  }

  private productInclude() {
    return {
      category: true,
      variants: {
        orderBy: [{ colorSlug: 'asc' }, { size: 'asc' }],
        include: {
          images: {
            orderBy: {
              sortOrder: 'asc',
            },
          },
        },
      },
      images: {
        orderBy: {
          sortOrder: 'asc',
        },
      },
    } satisfies Prisma.ProductInclude;
  }

  private async createVariants(
    tx: Prisma.TransactionClient,
    productId: string,
    variants: AdminProductVariantDto[],
  ) {
    for (const variant of variants) {
      const createdVariant = await tx.productVariant.create({
        data: {
          productId,
          colorName: variant.colorName.trim(),
          colorSlug: variant.colorSlug.trim(),
          colorHex: variant.colorHex,
          size: variant.size.trim(),
          stock: variant.stock,
          sku: variant.sku?.trim() || undefined,
        },
      });

      if (variant.images.length > 0) {
        await tx.productImage.createMany({
          data: variant.images.map((image) => ({
            productId,
            variantId: createdVariant.id,
            url: image.url,
            publicId: image.publicId,
            altText: image.altText,
            sortOrder: image.sortOrder,
            isPrimary: image.isPrimary ?? false,
          })),
        });
      }
    }
  }

  private async findProductOrThrow(tx: Prisma.TransactionClient, id: string) {
    const product = await tx.product.findUnique({
      where: { id },
      include: this.productInclude(),
    });

    if (!product) {
      throw new NotFoundException('Product not found.');
    }

    return product;
  }

  private serializeProduct(product: Prisma.ProductGetPayload<{
    include: ReturnType<AdminProductsService['productInclude']>;
  }>) {
    const primaryImage =
      product.variants.flatMap((variant) => variant.images).find((image) => image.isPrimary) ??
      product.images.find((image) => image.isPrimary) ??
      product.variants.flatMap((variant) => variant.images)[0] ??
      product.images[0] ??
      null;

    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      priceInPaise: product.priceInPaise,
      status: product.status,
      category: product.category,
      primaryImage,
      stock: product.stock,
      lowStock: product.stock > 0 && product.stock <= this.lowStockThreshold,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
      variants: product.variants.map((variant) => ({
        id: variant.id,
        colorName: variant.colorName,
        colorSlug: variant.colorSlug,
        colorHex: variant.colorHex,
        size: variant.size,
        stock: variant.stock,
        lowStock: variant.stock > 0 && variant.stock <= this.lowStockThreshold,
        sku: variant.sku,
        images: variant.images,
      })),
    };
  }
}
