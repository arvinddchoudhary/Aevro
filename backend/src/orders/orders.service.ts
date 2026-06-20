import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async createOrder(dto: CreateOrderDto) {
    const productIds = dto.items.map((item) => item.productId);

    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    const productsMap = new Map(products.map((p) => [p.id, p]));

    let totalInPaise = 0;
    const orderItemsData: Prisma.OrderItemUncheckedCreateWithoutOrderInput[] = [];

    for (const item of dto.items) {
      const product = productsMap.get(item.productId);

      if (!product) {
        throw new BadRequestException(`Product with ID ${item.productId} not found`);
      }

      if (product.stock < item.quantity) {
        throw new BadRequestException(
          `Insufficient stock for product ${product.name}. Available: ${product.stock}`,
        );
      }

      const lineTotalInPaise = product.priceInPaise * item.quantity;
      totalInPaise += lineTotalInPaise;

      orderItemsData.push({
        productId: product.id,
        productName: product.name,
        productSlug: product.slug,
        quantity: item.quantity,
        unitPriceInPaise: product.priceInPaise,
        lineTotalInPaise,
        selectedColor: item.selectedColor,
        selectedSize: item.selectedSize,
      });
    }

    const orderNumber = `AEVRO-${Date.now().toString().slice(-8)}`;

    const order = await this.prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          customerName: dto.customerName,
          customerEmail: dto.customerEmail,
          customerPhone: dto.customerPhone,
          shippingAddress: dto.shippingAddress,
          shippingCity: dto.shippingCity,
          shippingState: dto.shippingState,
          shippingPincode: dto.shippingPincode,
          totalInPaise,
          status: 'PENDING',
          items: {
            create: orderItemsData,
          },
        },
        include: {
          items: true,
          payment: true,
        },
      });

      return newOrder;
    });

    return {
      success: true,
      data: this.serializeOrder(order),
    };
  }

  async findOrderById(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        items: true,
        payment: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return {
      success: true,
      data: this.serializeOrder(order),
    };
  }

  private serializeOrder(
    order: Prisma.OrderGetPayload<{ include: { items: true; payment?: true } }>,
  ) {
    return {
      id: order.id,
      orderNumber: order.orderNumber,
      userId: order.userId,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      customerPhone: order.customerPhone,
      shippingAddress: order.shippingAddress,
      shippingCity: order.shippingCity,
      shippingState: order.shippingState,
      shippingPincode: order.shippingPincode,
      totalInPaise: order.totalInPaise,
      status: order.status,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      items: order.items.map((item) => ({
        id: item.id,
        productId: item.productId,
        productName: item.productName,
        productSlug: item.productSlug,
        quantity: item.quantity,
        unitPriceInPaise: item.unitPriceInPaise,
        lineTotalInPaise: item.lineTotalInPaise,
        selectedColor: item.selectedColor,
        selectedSize: item.selectedSize,
      })),
      payment: order.payment
        ? {
            id: order.payment.id,
            status: order.payment.status,
            provider: order.payment.provider,
            providerOrderId: order.payment.providerOrderId,
            amountInPaise: order.payment.amountInPaise,
            currency: order.payment.currency,
          }
        : undefined,
    };
  }
}
