import { Body, Controller, Post } from '@nestjs/common';
import { CreateRazorpayOrderDto } from './dto/create-razorpay-order.dto';
import { VerifyPaymentDto } from './dto/verify-payment.dto';
import { PaymentsService } from './payments.service';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('create-order')
  async createRazorpayOrder(@Body() dto: CreateRazorpayOrderDto) {
    return this.paymentsService.createRazorpayOrder(dto.orderId);
  }

  @Post('verify')
  async verifyPayment(@Body() dto: VerifyPaymentDto) {
    return this.paymentsService.verifyPayment(dto);
  }
}
