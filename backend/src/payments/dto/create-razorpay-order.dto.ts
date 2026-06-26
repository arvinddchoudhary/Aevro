import { IsString, Length } from 'class-validator';

export class CreateRazorpayOrderDto {
  @IsString()
  orderId!: string;

  @IsString()
  @Length(16, 128)
  idempotencyKey!: string;
}
