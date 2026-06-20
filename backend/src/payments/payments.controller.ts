import { Body, Controller, Inject, Post } from '@nestjs/common';
import { CreateRazorpayOrderDto } from './dto/create-razorpay-order.dto';
import { VerifyRazorpayPaymentDto } from './dto/verify-razorpay-payment.dto';
import { PaymentsService } from './payments.service';

@Controller('payments')
export class PaymentsController {
  constructor(
    @Inject(PaymentsService)
    private readonly paymentsService: PaymentsService,
  ) {}

  @Post('razorpay/order')
  async createRazorpayOrder(@Body() dto: CreateRazorpayOrderDto) {
    const paymentOrder = await this.paymentsService.createRazorpayOrder(dto);

    return {
      success: true,
      data: paymentOrder,
    };
  }

  @Post('razorpay/verify')
  async verifyRazorpayPayment(@Body() dto: VerifyRazorpayPaymentDto) {
    const payment = await this.paymentsService.verifyRazorpayPayment(dto);

    return {
      success: true,
      data: payment,
    };
  }
}
