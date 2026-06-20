import { Type } from 'class-transformer';
import {
  IsArray,
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

export class CreateOrderItemDto {
  @IsString()
  productId!: string;

  @IsInt()
  @Min(1)
  quantity!: number;

  @IsString()
  @IsOptional()
  selectedColor?: string;

  @IsString()
  @IsOptional()
  selectedSize?: string;
}

export class CreateOrderDto {
  @IsString()
  customerName!: string;

  @IsEmail()
  customerEmail!: string;

  @IsString()
  customerPhone!: string;

  @IsString()
  shippingAddress!: string;

  @IsString()
  shippingCity!: string;

  @IsString()
  shippingState!: string;

  @IsString()
  shippingPincode!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items!: CreateOrderItemDto[];
}
