import { IsString } from 'class-validator';

export class VerifyRazorpayPaymentDto {
  @IsString()
  orderId!: string;

  @IsString()
  razorpayOrderId!: string;

  @IsString()
  razorpayPaymentId!: string;

  @IsString()
  razorpaySignature!: string;
}
