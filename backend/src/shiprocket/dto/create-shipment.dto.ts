import { Type } from 'class-transformer';
import { IsIn, IsNotEmpty, IsNumber, IsString, Max, MaxLength, Min } from 'class-validator';
import { SHIPMENT_PACKAGE_TYPES, ShipmentPackageType } from '../package-recommendation';

export class CreateShipmentDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  pickupLocation!: string;

  @IsIn(SHIPMENT_PACKAGE_TYPES)
  packageType!: ShipmentPackageType;

  @Type(() => Number)
  @IsNumber({ allowNaN: false, allowInfinity: false })
  @Min(0.05)
  @Max(30)
  weightKg!: number;

  @Type(() => Number)
  @IsNumber({ allowNaN: false, allowInfinity: false })
  @Min(1)
  @Max(200)
  lengthCm!: number;

  @Type(() => Number)
  @IsNumber({ allowNaN: false, allowInfinity: false })
  @Min(1)
  @Max(200)
  breadthCm!: number;

  @Type(() => Number)
  @IsNumber({ allowNaN: false, allowInfinity: false })
  @Min(1)
  @Max(200)
  heightCm!: number;
}
