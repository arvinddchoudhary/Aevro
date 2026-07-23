import { ProductReviewStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsString, MaxLength, MinLength, ValidateIf } from 'class-validator';

export class ModerateReviewDto {
  @IsEnum(ProductReviewStatus)
  status!: ProductReviewStatus;

  @ValidateIf((value: ModerateReviewDto) =>
    value.status === ProductReviewStatus.REJECTED || value.status === ProductReviewStatus.HIDDEN,
  )
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  reason?: string;
}
