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
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import { AuthenticatedRequest } from '../auth/types/authenticated-request';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrdersService } from './orders.service';

@Controller('orders')
export class OrdersController {
  constructor(@Inject(OrdersService) private readonly ordersService: OrdersService) {}

  @Post()
  @UseGuards(OptionalJwtAuthGuard)
  async createOrder(
    @Body() createOrderDto: CreateOrderDto,
    @Req() request: AuthenticatedRequest,
  ) {
    const order = await this.ordersService.createOrder(
      createOrderDto,
      request.user?.id,
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
  async getOrder(@Param('id') id: string) {
    const order = await this.ordersService.getOrder(id);

    return {
      success: true,
      data: order,
    };
  }
}
