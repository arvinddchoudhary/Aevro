import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import * as crypto from 'crypto';
import Razorpay from 'razorpay';
import { OrdersService } from '../orders/orders.service';
import { PrismaService } from '../prisma/prisma.service';
import { VerifyPaymentDto } from './dto/verify-payment.dto';

@Injectable()
export class PaymentsService {
  private razorpayClient: Razorpay;

  constructor(
    private readonly prisma: PrismaService,
    private readonly ordersService: OrdersService,
  ) {
    this.razorpayClient = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });
  }

  async createRazorpayOrder(orderId: string) {
    const orderResponse = await this.ordersService.findOrderById(orderId);
    const order = orderResponse.data;

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const razorpayOrder = await this.razorpayClient.orders.create({
      amount: order.totalInPaise,
      currency: 'INR',
      receipt: order.orderNumber,
    });

    await this.prisma.payment.upsert({
      where: { orderId },
      create: {
        orderId,
        provider: 'RAZORPAY',
        status: 'PENDING',
        amountInPaise: order.totalInPaise,
        currency: 'INR',
        providerOrderId: razorpayOrder.id,
      },
      update: {
        providerOrderId: razorpayOrder.id,
      },
    });

    return {
      success: true,
      data: {
        razorpayOrderId: razorpayOrder.id,
        amount: order.totalInPaise,
        currency: 'INR',
        keyId: process.env.RAZORPAY_KEY_ID,
      },
    };
  }

  async verifyPayment(dto: VerifyPaymentDto) {
    const body = dto.razorpayOrderId + '|' + dto.razorpayPaymentId;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(body)
      .digest('hex');

    if (expectedSignature !== dto.razorpaySignature) {
      throw new BadRequestException('Invalid payment signature');
    }

    const payment = await this.prisma.payment.findUnique({
      where: { orderId: dto.orderId },
    });

    if (!payment) {
      throw new NotFoundException('Payment record not found');
    }

    const orderResponse = await this.ordersService.findOrderById(dto.orderId);
    const order = orderResponse.data;

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: 'PAID',
          providerPaymentId: dto.razorpayPaymentId,
          providerSignature: dto.razorpaySignature,
          paidAt: new Date(),
        },
      });

      await tx.order.update({
        where: { id: order.id },
        data: {
          status: 'CONFIRMED',
        },
      });

      for (const item of order.items) {
        if (item.productId) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stock: { decrement: item.quantity },
            },
          });
        }
      }
    });

    return {
      success: true,
      data: {
        orderId: order.id,
        orderNumber: order.orderNumber,
      },
    };
  }
}
