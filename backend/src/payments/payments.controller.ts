import { Body, Controller, Inject, Post, Req, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthenticatedRequest } from '../auth/types/authenticated-request';
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
  @UseGuards(JwtAuthGuard)
  async createRazorpayOrder(
    @Body() dto: CreateRazorpayOrderDto,
    @Req() request: AuthenticatedRequest,
  ) {
    const paymentOrder = await this.paymentsService.createRazorpayOrder(
      dto,
      request.user?.id ?? '',
      request.user?.role === UserRole.ADMIN,
    );

    return {
      success: true,
      data: paymentOrder,
    };
  }

  @Post('razorpay/verify')
  @UseGuards(JwtAuthGuard)
  async verifyRazorpayPayment(
    @Body() dto: VerifyRazorpayPaymentDto,
    @Req() request: AuthenticatedRequest,
  ) {
    const payment = await this.paymentsService.verifyRazorpayPayment(
      dto,
      request.user?.id ?? '',
      request.user?.role === UserRole.ADMIN,
    );

    return {
      success: true,
      data: payment,
    };
  }
}
