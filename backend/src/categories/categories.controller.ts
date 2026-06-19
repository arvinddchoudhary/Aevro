import { Controller, Get, Query } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { ListCategoriesQueryDto } from './dto/list-categories-query.dto';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  async listCategories(@Query() query: ListCategoriesQueryDto) {
    const categories = await this.categoriesService.listActiveCategories(query);

    return {
      success: true,
      data: categories,
    };
  }
}
