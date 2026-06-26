import { IsBoolean, IsEnum, IsInt, IsJSON, IsOptional, IsString, Min } from 'class-validator';
import { HomepageSectionType } from '@prisma/client';

export class CreateHomepageSectionDto {
  @IsEnum(HomepageSectionType)
  type!: HomepageSectionType;

  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  subtitle?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsString()
  @IsOptional()
  imagePublicId?: string;

  @IsString()
  @IsOptional()
  ctaLabel?: string;

  @IsString()
  @IsOptional()
  ctaHref?: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  sortOrder?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsJSON()
  @IsOptional()
  metadata?: string;
}

export class UpdateHomepageSectionDto {
  @IsEnum(HomepageSectionType)
  @IsOptional()
  type?: HomepageSectionType;

  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  subtitle?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsString()
  @IsOptional()
  imagePublicId?: string;

  @IsString()
  @IsOptional()
  ctaLabel?: string;

  @IsString()
  @IsOptional()
  ctaHref?: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  sortOrder?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsJSON()
  @IsOptional()
  metadata?: string;
}

export class UpdateHomepageSectionStatusDto {
  @IsBoolean()
  isActive!: boolean;
}
