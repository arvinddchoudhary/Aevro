import { Body, Controller, Inject, Post, Req } from '@nestjs/common';
import type { FastifyRequest } from 'fastify';
import { CheckoutDeliveryEstimateDto } from './dto/checkout-delivery-estimate.dto';
import { ShiprocketService } from './shiprocket.service';

@Controller('checkout')
export class CheckoutDeliveryEstimateController {
  constructor(@Inject(ShiprocketService) private readonly shiprocket: ShiprocketService) {}

  @Post('delivery-estimate')
  async deliveryEstimate(
    @Body() dto: CheckoutDeliveryEstimateDto,
    @Req() request: FastifyRequest,
  ) {
    return {
      success: true,
      data: await this.shiprocket.getCheckoutDeliveryEstimate(dto, request.ip),
    };
  }
}
