import { Inject, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

type ProductSearchClient = PrismaService | Prisma.TransactionClient;

@Injectable()
export class ProductSearchIndexService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async syncProduct(productId: string, client: ProductSearchClient = this.prisma) {
    const product = await client.product.findUnique({
      where: { id: productId },
      select: {
        id: true,
        name: true,
        slug: true,
        sku: true,
        description: true,
        category: {
          select: {
            name: true,
            slug: true,
          },
        },
        variants: {
          select: {
            colorName: true,
            colorSlug: true,
            size: true,
            sku: true,
          },
        },
      },
    });

    if (!product) {
      await client.productSearchDocument.deleteMany({ where: { productId } });
      return;
    }

    const nameText = product.name;
    const slugText = product.slug;
    const skuText = product.sku ?? '';
    const categoryText = product.category
      ? `${product.category.name} ${product.category.slug}`
      : '';
    const attributeText = product.variants
      .flatMap((variant) => [
        variant.colorName,
        variant.colorSlug,
        variant.size,
        variant.sku ?? '',
      ])
      .filter(Boolean)
      .join(' ');
    const descriptionText = product.description ?? '';
    const searchText = [
      nameText,
      slugText,
      skuText,
      categoryText,
      attributeText,
      descriptionText,
    ]
      .filter(Boolean)
      .join(' ');

    await client.productSearchDocument.upsert({
      where: { productId },
      create: {
        productId,
        nameText,
        slugText,
        skuText: skuText || null,
        categoryText: categoryText || null,
        attributeText: attributeText || null,
        descriptionText: descriptionText || null,
        searchText,
      },
      update: {
        nameText,
        slugText,
        skuText: skuText || null,
        categoryText: categoryText || null,
        attributeText: attributeText || null,
        descriptionText: descriptionText || null,
        searchText,
      },
    });

    await client.$executeRaw`
      UPDATE "product_search_documents"
      SET "searchVector" =
        setweight(to_tsvector('simple', COALESCE("nameText", '')), 'A') ||
        setweight(to_tsvector('simple', COALESCE("slugText", '')), 'A') ||
        setweight(to_tsvector('simple', COALESCE("skuText", '')), 'A') ||
        setweight(to_tsvector('simple', COALESCE("categoryText", '')), 'A') ||
        setweight(to_tsvector('simple', COALESCE("attributeText", '')), 'B') ||
        setweight(to_tsvector('simple', COALESCE("descriptionText", '')), 'C')
      WHERE "productId" = ${productId}
    `;
  }
}
