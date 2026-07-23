import { IsIn, IsInt, IsOptional, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

export const PRODUCT_REVIEW_SORTS = ['newest', 'highest', 'lowest'] as const;
export type ProductReviewSort = (typeof PRODUCT_REVIEW_SORTS)[number];

export class ListProductReviewsQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(12)
  limit?: number = 6;

  @IsOptional()
  @IsIn(PRODUCT_REVIEW_SORTS)
  sort?: ProductReviewSort = 'newest';
}
