import { Body, Controller, Get, Inject, Param, Post, Req, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AuthenticatedRequest } from '../auth/types/authenticated-request';
import { AssignAwbDto } from './dto/assign-awb.dto';
import { CreateShipmentDto } from './dto/create-shipment.dto';
import { SchedulePickupDto } from './dto/schedule-pickup.dto';
import { ShiprocketService } from './shiprocket.service';

@Controller('admin/orders/:orderId/shipment')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class ShiprocketAdminController {
  constructor(@Inject(ShiprocketService) private readonly shiprocket: ShiprocketService) {}

  @Get()
  async getShipment(@Param('orderId') orderId: string) {
    return { success: true, data: await this.shiprocket.getAdminShipment(orderId) };
  }

  @Get('shiprocket/rates')
  async getRates(@Param('orderId') orderId: string) {
    return { success: true, data: await this.shiprocket.getRates(orderId) };
  }

  @Get('shiprocket/review')
  async review(@Param('orderId') orderId: string) {
    return { success: true, data: await this.shiprocket.getShipmentReview(orderId) };
  }

  @Post('shiprocket/create')
  async create(
    @Param('orderId') orderId: string,
    @Body() dto: CreateShipmentDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return {
      success: true,
      data: await this.shiprocket.createShipment(orderId, dto, request.user?.id ?? ''),
    };
  }

  @Post('shiprocket/assign-awb')
  async assignAwb(@Param('orderId') orderId: string, @Body() dto: AssignAwbDto) {
    return { success: true, data: await this.shiprocket.assignAwb(orderId, dto) };
  }

  @Post('shiprocket/pickup')
  async pickup(@Param('orderId') orderId: string, @Body() dto: SchedulePickupDto) {
    return { success: true, data: await this.shiprocket.schedulePickup(orderId, dto) };
  }

  @Post('shiprocket/cancel')
  async cancel(@Param('orderId') orderId: string) {
    return { success: true, data: await this.shiprocket.cancelShipment(orderId) };
  }

  @Post('shiprocket/refresh-tracking')
  async refreshTracking(@Param('orderId') orderId: string) {
    return { success: true, data: await this.shiprocket.refreshTracking(orderId) };
  }
}
