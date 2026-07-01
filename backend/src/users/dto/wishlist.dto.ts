import { IsOptional, IsString } from 'class-validator';

export class AddWishlistItemDto {
  @IsString()
  productId!: string;

  @IsString()
  @IsOptional()
  variantId?: string;
}
