import { Transform, Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';

export class CreateOrderCustomerDto {
  @IsString()
  @MinLength(2)
  fullName!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @Matches(/^[0-9+\-\s()]{7,20}$/)
  phone!: string;
}

export class CreateOrderShippingAddressDto {
  @IsString()
  @MinLength(5)
  addressLine!: string;

  @IsString()
  @MinLength(2)
  city!: string;

  @IsString()
  @MinLength(2)
  state!: string;

  @IsString()
  @MinLength(3)
  postalCode!: string;

  @IsString()
  @MinLength(2)
  country!: string;
}

export class CreateOrderItemDto {
  @IsString()
  productId!: string;

  @IsString()
  @IsOptional()
  variantId?: string;

  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  @Max(99)
  quantity!: number;
}

export class CreateOrderDto {
  @ValidateNested()
  @Type(() => CreateOrderCustomerDto)
  customer!: CreateOrderCustomerDto;

  @ValidateNested()
  @Type(() => CreateOrderShippingAddressDto)
  shippingAddress!: CreateOrderShippingAddressDto;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items!: CreateOrderItemDto[];
}
