import { ProductStatus } from '@prisma/client';
import { Transform } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Max,
  Min,
} from 'class-validator';

export enum ProductSort {
  Relevance = 'relevance',
  Featured = 'featured',
  Newest = 'newest',
  PriceAsc = 'price_asc',
  PriceDesc = 'price_desc',
}

function parseMultiValue(value: unknown) {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  const values = Array.isArray(value) ? value : [value];

  return values
    .flatMap((item) => String(item).split(','))
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
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

  @Transform(({ value }) => parseMultiValue(value))
  @IsArray()
  @ArrayMaxSize(20)
  @IsString({ each: true })
  @IsOptional()
  category?: string[];

  @IsString()
  @MaxLength(80)
  @IsOptional()
  search?: string;

  @Transform(({ value }) => parseMultiValue(value))
  @IsArray()
  @ArrayMaxSize(20)
  @IsString({ each: true })
  @IsOptional()
  color?: string[];

  @Transform(({ value }) => parseMultiValue(value))
  @IsArray()
  @ArrayMaxSize(20)
  @IsString({ each: true })
  @IsOptional()
  size?: string[];

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

  @Transform(({ value }) => {
    if (value === undefined || value === '') {
      return undefined;
    }

    if (value === true || value === 'true') {
      return true;
    }

    if (value === false || value === 'false') {
      return false;
    }

    return value;
  })
  @IsBoolean()
  @IsOptional()
  inStock?: boolean;

  @IsEnum(ProductSort)
  @IsOptional()
  sort?: ProductSort;
}
