import { Body, Controller, Get, Inject, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AdminOrdersService } from './admin-orders.service';
import {
  ListAdminOrdersQueryDto,
  UpdateAdminOrderStatusDto,
} from './dto/admin-order.dto';

@Controller('admin/orders')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminOrdersController {
  constructor(
    @Inject(AdminOrdersService)
    private readonly adminOrdersService: AdminOrdersService,
  ) {}

  @Get()
  async listOrders(@Query() query: ListAdminOrdersQueryDto) {
    const result = await this.adminOrdersService.listOrders(query);

    return {
      success: true,
      data: result.data,
      meta: result.meta,
    };
  }

  @Get(':id')
  async getOrder(@Param('id') id: string) {
    return {
      success: true,
      data: await this.adminOrdersService.getOrder(id),
    };
  }

  @Patch(':id/status')
  async updateOrderStatus(
    @Param('id') id: string,
    @Body() dto: UpdateAdminOrderStatusDto,
  ) {
    return {
      success: true,
      data: await this.adminOrdersService.updateOrderStatus(id, dto),
    };
  }
}
