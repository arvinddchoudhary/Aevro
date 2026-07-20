import { Body, Controller, Get, Inject, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AdminProductsService } from './admin-products.service';
import { CreateAdminCategoryDto } from './dto/admin-category.dto';
import {
  CreateAdminProductDto,
  ReorderAdminProductsDto,
  UpdateAdminProductDto,
  UpdateAdminProductStatusDto,
} from './dto/admin-product.dto';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminProductsController {
  constructor(
    @Inject(AdminProductsService)
    private readonly adminProductsService: AdminProductsService,
  ) {}

  @Get('categories')
  async listCategories() {
    return {
      success: true,
      data: await this.adminProductsService.listCategories(),
    };
  }

  @Post('categories')
  async createCategory(@Body() dto: CreateAdminCategoryDto) {
    return {
      success: true,
      data: await this.adminProductsService.createCategory(dto),
    };
  }

  @Get('products')
  async listProducts() {
    return {
      success: true,
      data: await this.adminProductsService.listProducts(),
    };
  }

  @Post('products')
  async createProduct(@Body() dto: CreateAdminProductDto) {
    return {
      success: true,
      data: await this.adminProductsService.createProduct(dto),
    };
  }

  @Patch('products/reorder')
  async reorderProducts(@Body() dto: ReorderAdminProductsDto) {
    return {
      success: true,
      data: await this.adminProductsService.reorderProducts(dto),
    };
  }

  @Get('products/:id')
  async getProduct(@Param('id') id: string) {
    return {
      success: true,
      data: await this.adminProductsService.getProduct(id),
    };
  }

  @Patch('products/:id')
  async updateProduct(
    @Param('id') id: string,
    @Body() dto: UpdateAdminProductDto,
  ) {
    return {
      success: true,
      data: await this.adminProductsService.updateProduct(id, dto),
    };
  }

  @Patch('products/:id/status')
  async updateProductStatus(
    @Param('id') id: string,
    @Body() dto: UpdateAdminProductStatusDto,
  ) {
    return {
      success: true,
      data: await this.adminProductsService.updateProductStatus(id, dto),
    };
  }
}
