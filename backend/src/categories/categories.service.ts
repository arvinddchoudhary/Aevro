import { Inject, Injectable } from '@nestjs/common';
import { ProductStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ListCategoriesQueryDto } from './dto/list-categories-query.dto';

@Injectable()
export class CategoriesService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async listActiveCategories(query: ListCategoriesQueryDto) {
    const includeEmpty = query.includeEmpty ?? false;

    const categories = await this.prisma.category.findMany({
      where: includeEmpty
        ? undefined
        : {
            products: {
              some: {
                status: ProductStatus.ACTIVE,
              },
            },
          },
      orderBy: {
        name: 'asc',
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        _count: {
          select: {
            products: {
              where: {
                status: ProductStatus.ACTIVE,
              },
            },
          },
        },
      },
    });

    return categories.map((category) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      activeProductCount: category._count.products,
    }));
  }
}
