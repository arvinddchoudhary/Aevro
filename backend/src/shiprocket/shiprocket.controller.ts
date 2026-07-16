import { Controller, Get, Inject, Param, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthenticatedRequest } from '../auth/types/authenticated-request';
import { ShiprocketService } from './shiprocket.service';

@Controller('orders')
export class ShiprocketController {
  constructor(@Inject(ShiprocketService) private readonly shiprocket: ShiprocketService) {}

  @Get(':orderId/tracking')
  @UseGuards(JwtAuthGuard)
  async tracking(
    @Param('orderId') orderId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    return {
      success: true,
      data: await this.shiprocket.getCustomerTracking(
        orderId,
        request.user?.id ?? '',
        request.user?.role,
      ),
    };
  }
}
