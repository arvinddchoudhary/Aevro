import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OrderStatus, Prisma, ProductStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';

type OrderWithItems = Prisma.OrderGetPayload<{
  include: ReturnType<OrdersService['orderInclude']>;
}>;

@Injectable()
export class OrdersService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async createOrder(createOrderDto: CreateOrderDto, userId: string) {
    if (!userId) {
      throw new BadRequestException('Authenticated user is required to create an order.');
    }

    if (createOrderDto.idempotencyKey) {
      const existingOrder = await this.prisma.order.findUnique({
        where: {
          idempotencyKey: createOrderDto.idempotencyKey,
        },
        include: this.orderInclude(),
      });

      if (existingOrder) {
        if (existingOrder.userId !== userId) {
          throw new BadRequestException('Order idempotency key is already used.');
        }

        return this.serializeOrder(existingOrder);
      }
    }

    const requestedItems = this.mergeDuplicateItems(createOrderDto);
    const productIds = Array.from(
      new Set(requestedItems.map((item) => item.productId)),
    );

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
        variants: {
          select: {
            id: true,
            colorName: true,
            colorSlug: true,
            size: true,
            stock: true,
          },
        },
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

      const variant = item.variantId
        ? product.variants.find((productVariant) => productVariant.id === item.variantId)
        : null;

      if (item.variantId && !variant) {
        throw new BadRequestException(`${product.name} variant is unavailable.`);
      }

      if (product.variants.length > 0 && !variant) {
        throw new BadRequestException(
          `${product.name} requires a colour and size selection.`,
        );
      }

      const stock = variant?.stock ?? product.stock;

      if (stock < item.quantity) {
        throw new BadRequestException(
          `${product.name}${variant ? ` in ${variant.colorName} / ${variant.size}` : ''} has only ${stock} in stock.`,
        );
      }

      return {
        productId: product.id,
        variantId: variant?.id,
        productName: product.name,
        productSlug: product.slug,
        quantity: item.quantity,
        unitPriceInPaise: product.priceInPaise,
        lineTotalInPaise: product.priceInPaise * item.quantity,
        selectedColor: variant?.colorName ?? product.color,
        selectedSize: variant?.size ?? product.size,
      };
    });
    const totalInPaise = orderItems.reduce(
      (total, item) => total + item.lineTotalInPaise,
      0,
    );
    const { customer, shippingAddress } = createOrderDto;

    try {
      const order = await this.prisma.order.create({
        data: {
          orderNumber: this.createOrderNumber(),
          userId,
          idempotencyKey: createOrderDto.idempotencyKey,
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
        include: this.orderInclude(),
      });

      return this.serializeOrder(order);
    } catch (error) {
      if (
        this.isUniqueConstraintError(error) &&
        createOrderDto.idempotencyKey
      ) {
        const existingOrder = await this.prisma.order.findUnique({
          where: {
            idempotencyKey: createOrderDto.idempotencyKey,
          },
          include: this.orderInclude(),
        });

        if (existingOrder) {
          return this.serializeOrder(existingOrder);
        }
      }

      throw error;
    }
  }

  async getOrder(id: string) {
    const order = await this.prisma.order.findUnique({
      where: {
        id,
      },
      include: this.orderInclude(),
    });

    if (!order) {
      throw new NotFoundException('Order not found.');
    }

    return this.serializeOrder(order);
  }

  async getOrderForUserOrAdmin(id: string, userId: string, isAdmin: boolean) {
    const order = await this.prisma.order.findUnique({
      where: {
        id,
      },
      include: this.orderInclude(),
    });

    if (!order) {
      throw new NotFoundException('Order not found.');
    }

    if (!isAdmin && order.userId !== userId) {
      throw new ForbiddenException('You do not have access to this order.');
    }

    return this.serializeOrder(order);
  }

  async listCurrentUserOrders(userId: string) {
    const orders = await this.prisma.order.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: this.orderInclude(),
    });

    return orders.map((order) => this.serializeOrder(order));
  }

  async getCurrentUserOrder(userId: string, orderId: string) {
    const order = await this.prisma.order.findFirst({
      where: {
        id: orderId,
        userId,
      },
      include: this.orderInclude(),
    });

    if (!order) {
      throw new NotFoundException('Order not found.');
    }

    return this.serializeOrder(order);
  }

  private mergeDuplicateItems(createOrderDto: CreateOrderDto) {
    const quantityByItemKey = new Map<
      string,
      {
        productId: string;
        variantId?: string;
        quantity: number;
      }
    >();

    createOrderDto.items.forEach((item) => {
      const itemKey = `${item.productId}:${item.variantId ?? 'default'}`;
      const existingItem = quantityByItemKey.get(itemKey);

      quantityByItemKey.set(itemKey, {
        productId: item.productId,
        variantId: item.variantId,
        quantity: (existingItem?.quantity ?? 0) + item.quantity,
      });
    });

    return Array.from(quantityByItemKey.values());
  }

  private createOrderNumber() {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).slice(2, 8).toUpperCase();

    return `AEVRO-${timestamp}-${random}`;
  }

  private isUniqueConstraintError(error: unknown) {
    return (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    );
  }

  private orderInclude() {
    return {
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              priceInPaise: true,
              status: true,
              images: {
                orderBy: {
                  sortOrder: 'asc',
                },
                select: {
                  id: true,
                  url: true,
                  altText: true,
                  sortOrder: true,
                },
              },
            },
          },
          variant: {
            select: {
              id: true,
              colorName: true,
              colorSlug: true,
              colorHex: true,
              size: true,
              stock: true,
              sku: true,
            },
          },
        },
      },
      payment: true,
    } satisfies Prisma.OrderInclude;
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
      payment: order.payment
        ? {
            id: order.payment.id,
            status: order.payment.status,
            provider: order.payment.provider,
            amountInPaise: order.payment.amountInPaise,
            currency: order.payment.currency,
            paidAt: order.payment.paidAt,
          }
        : null,
      items: order.items.map((item) => ({
        id: item.id,
        productId: item.productId,
        variantId: item.variantId,
        productName: item.productName,
        productSlug: item.productSlug,
        quantity: item.quantity,
        unitPriceInPaise: item.unitPriceInPaise,
        lineTotalInPaise: item.lineTotalInPaise,
        selectedColor: item.selectedColor,
        selectedSize: item.selectedSize,
        variant: item.variant,
        product: item.product
          ? {
              id: item.product.id,
              name: item.product.name,
              slug: item.product.slug,
              priceInPaise: item.product.priceInPaise,
              status: item.product.status,
              images: item.product.images,
            }
          : null,
      })),
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };
  }
}
