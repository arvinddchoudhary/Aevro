import {
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UpdateProfileDto {
  @IsString()
  @MinLength(2)
  @IsOptional()
  name?: string;

  @IsString()
  @Matches(/^[0-9+\-\s()]{7,20}$/)
  @IsOptional()
  phone?: string;
}

export class CreateAddressDto {
  @IsString()
  @MinLength(2)
  @MaxLength(40)
  @IsOptional()
  label?: string;

  @IsString()
  @MinLength(2)
  fullName!: string;

  @IsString()
  @Matches(/^[0-9+\-\s()]{7,20}$/)
  phone!: string;

  @IsString()
  @MinLength(5)
  addressLine1!: string;

  @IsString()
  @IsOptional()
  addressLine2?: string;

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

export class UpdateAddressDto extends CreateAddressDto {}
