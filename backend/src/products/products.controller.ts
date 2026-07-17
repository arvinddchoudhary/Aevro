import { Controller, Get, Inject, Param, Query } from '@nestjs/common';
import { ListProductsQueryDto } from './dto/list-products-query.dto';
import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
  constructor(
    @Inject(ProductsService)
    private readonly productsService: ProductsService,
  ) {}

  @Get()
  async listProducts(@Query() query: ListProductsQueryDto) {
    return this.productsService.listProducts(query);
  }

  @Get('suggestions')
  async getSuggestions(@Query('q') query?: string, @Query('limit') limit?: string) {
    return this.productsService.getSuggestions(query, Number(limit ?? 8));
  }

  @Get(':identifier')
  async getProduct(@Param('identifier') identifier: string) {
    const product = await this.productsService.getPublicProduct(identifier);

    return {
      success: true,
      data: product,
    };
  }
}
