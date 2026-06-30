import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthenticatedRequest } from '../auth/types/authenticated-request';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrdersService } from './orders.service';

@Controller('orders')
export class OrdersController {
  constructor(@Inject(OrdersService) private readonly ordersService: OrdersService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async createOrder(
    @Body() createOrderDto: CreateOrderDto,
    @Req() request: AuthenticatedRequest,
  ) {
    const order = await this.ordersService.createOrder(
      createOrderDto,
      request.user?.id ?? '',
    );

    return {
      success: true,
      data: order,
    };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async listMyOrders(@Req() request: AuthenticatedRequest) {
    const orders = await this.ordersService.listCurrentUserOrders(
      request.user?.id ?? '',
    );

    return {
      success: true,
      data: orders,
    };
  }

  @Get('me/:id')
  @UseGuards(JwtAuthGuard)
  async getMyOrder(
    @Req() request: AuthenticatedRequest,
    @Param('id') id: string,
  ) {
    const order = await this.ordersService.getCurrentUserOrder(
      request.user?.id ?? '',
      id,
    );

    return {
      success: true,
      data: order,
    };
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getOrder(
    @Param('id') id: string,
    @Req() request: AuthenticatedRequest,
  ) {
    const order = await this.ordersService.getOrderForUserOrAdmin(
      id,
      request.user?.id ?? '',
      request.user?.role === UserRole.ADMIN,
    );

    return {
      success: true,
      data: order,
    };
  }
}
