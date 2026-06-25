import { ProductStatus } from '@prisma/client';
import { Transform } from 'class-transformer';
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
  @Transform(({ value }) => (value === undefined ? undefined : Number(value)))
  @IsInt()
  @Min(1)
  @IsOptional()
  page = 1;

  @Transform(({ value }) => (value === undefined ? undefined : Number(value)))
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

  @IsString()
  @IsOptional()
  color?: string;

  @IsString()
  @IsOptional()
  size?: string;

  @IsEnum(ProductStatus)
  @IsOptional()
  status: ProductStatus = ProductStatus.ACTIVE;

  @Transform(({ value }) => (value === undefined ? undefined : Number(value)))
  @IsInt()
  @Min(0)
  @IsOptional()
  minPrice?: number;

  @Transform(({ value }) => (value === undefined ? undefined : Number(value)))
  @IsInt()
  @Min(0)
  @IsOptional()
  maxPrice?: number;

  @IsEnum(ProductSort)
  @IsOptional()
  sort: ProductSort = ProductSort.Newest;
}
