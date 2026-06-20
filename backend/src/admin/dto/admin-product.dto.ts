import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsHexColor,
  IsInt,
  IsOptional,
  IsString,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { ProductStatus } from '@prisma/client';

export class AdminProductImageDto {
  @IsString()
  url!: string;

  @IsString()
  publicId!: string;

  @IsString()
  @IsOptional()
  altText?: string;

  @IsInt()
  @Min(0)
  sortOrder!: number;

  @IsOptional()
  isPrimary?: boolean;
}

export class AdminProductVariantDto {
  @IsString()
  @MinLength(2)
  colorName!: string;

  @IsString()
  @MinLength(2)
  colorSlug!: string;

  @IsHexColor()
  @IsOptional()
  colorHex?: string;

  @IsString()
  @MinLength(1)
  size!: string;

  @IsInt()
  @Min(0)
  stock!: number;

  @IsString()
  @IsOptional()
  sku?: string;

  @IsArray()
  @ArrayMaxSize(5)
  @ValidateNested({ each: true })
  @Type(() => AdminProductImageDto)
  images!: AdminProductImageDto[];
}

export class CreateAdminProductDto {
  @IsString()
  @MinLength(2)
  name!: string;

  @IsString()
  @MinLength(2)
  slug!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsInt()
  @Min(0)
  priceInPaise!: number;

  @IsString()
  categoryId!: string;

  @IsEnum(ProductStatus)
  status!: ProductStatus;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => AdminProductVariantDto)
  variants!: AdminProductVariantDto[];
}

export class UpdateAdminProductDto {
  @IsString()
  @MinLength(2)
  @IsOptional()
  name?: string;

  @IsString()
  @MinLength(2)
  @IsOptional()
  slug?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  priceInPaise?: number;

  @IsString()
  @IsOptional()
  categoryId?: string;

  @IsEnum(ProductStatus)
  @IsOptional()
  status?: ProductStatus;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => AdminProductVariantDto)
  @IsOptional()
  variants?: AdminProductVariantDto[];
}

export class UpdateAdminProductStatusDto {
  @IsEnum(ProductStatus)
  status!: ProductStatus;
}
