import { ProductStatus } from '@prisma/client';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export enum ProductSort {
  Newest = 'newest',
  PriceAsc = 'price_asc',
  PriceDesc = 'price_desc',
}

export class ListProductsQueryDto {
  @IsInt()
  @Min(1)
  @IsOptional()
  page = 1;

  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit = 12;

  @IsString()
  @IsOptional()
  category?: string;

  @IsString()
  @IsOptional()
  search?: string;

  @IsEnum(ProductStatus)
  @IsOptional()
  status: ProductStatus = ProductStatus.ACTIVE;

  @IsInt()
  @Min(0)
  @IsOptional()
  minPrice?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  maxPrice?: number;

  @IsEnum(ProductSort)
  @IsOptional()
  sort: ProductSort = ProductSort.Newest;
}
