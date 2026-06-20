import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OrderStatus, Prisma, ProductStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';

type OrderWithItems = Prisma.OrderGetPayload<{
  include: {
    items: true;
  };
}>;

@Injectable()
export class OrdersService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async createOrder(createOrderDto: CreateOrderDto) {
    const requestedItems = this.mergeDuplicateItems(createOrderDto);
    const productIds = requestedItems.map((item) => item.productId);

    const products = await this.prisma.product.findMany({
      where: {
        id: {
          in: productIds,
        },
        status: ProductStatus.ACTIVE,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        priceInPaise: true,
        color: true,
        size: true,
        stock: true,
      },
    });

    if (products.length !== productIds.length) {
      throw new BadRequestException('One or more products are unavailable.');
    }

    const productsById = new Map(products.map((product) => [product.id, product]));
    const orderItems = requestedItems.map((item) => {
      const product = productsById.get(item.productId);

      if (!product) {
        throw new BadRequestException('One or more products are unavailable.');
      }

      if (product.stock < item.quantity) {
        throw new BadRequestException(`${product.name} does not have enough stock.`);
      }

      return {
        productId: product.id,
        productName: product.name,
        productSlug: product.slug,
        quantity: item.quantity,
        unitPriceInPaise: product.priceInPaise,
        lineTotalInPaise: product.priceInPaise * item.quantity,
        selectedColor: product.color,
        selectedSize: product.size,
      };
    });
    const totalInPaise = orderItems.reduce(
      (total, item) => total + item.lineTotalInPaise,
      0,
    );
    const { customer, shippingAddress } = createOrderDto;

    const order = await this.prisma.order.create({
      data: {
        orderNumber: this.createOrderNumber(),
        customerName: customer.fullName.trim(),
        customerEmail: customer.email.trim().toLowerCase(),
        customerPhone: customer.phone.trim(),
        shippingAddress: shippingAddress.addressLine.trim(),
        shippingCity: shippingAddress.city.trim(),
        shippingState: shippingAddress.state.trim(),
        shippingPincode: shippingAddress.postalCode.trim(),
        shippingCountry: shippingAddress.country.trim(),
        totalInPaise,
        status: OrderStatus.PENDING,
        items: {
          create: orderItems,
        },
      },
      include: {
        items: true,
      },
    });

    return this.serializeOrder(order);
  }

  async getOrder(id: string) {
    const order = await this.prisma.order.findUnique({
      where: {
        id,
      },
      include: {
        items: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found.');
    }

    return this.serializeOrder(order);
  }

  private mergeDuplicateItems(createOrderDto: CreateOrderDto) {
    const quantityByProductId = new Map<string, number>();

    createOrderDto.items.forEach((item) => {
      quantityByProductId.set(
        item.productId,
        (quantityByProductId.get(item.productId) ?? 0) + item.quantity,
      );
    });

    return Array.from(quantityByProductId.entries()).map(([productId, quantity]) => ({
      productId,
      quantity,
    }));
  }

  private createOrderNumber() {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).slice(2, 8).toUpperCase();

    return `AEVRO-${timestamp}-${random}`;
  }

  private serializeOrder(order: OrderWithItems) {
    return {
      id: order.id,
      orderNumber: order.orderNumber,
      customer: {
        name: order.customerName,
        email: order.customerEmail,
        phone: order.customerPhone,
      },
      shippingAddress: {
        addressLine: order.shippingAddress,
        city: order.shippingCity,
        state: order.shippingState,
        postalCode: order.shippingPincode,
        country: order.shippingCountry,
      },
      totalInPaise: order.totalInPaise,
      status: order.status,
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
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };
  }
}
