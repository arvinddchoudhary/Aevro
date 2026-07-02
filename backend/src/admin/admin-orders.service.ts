import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { NotificationsService } from '../notifications/notifications.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  AdminOrderSort,
  INVALID_ORDER_STATUS_MESSAGE,
  ListAdminOrdersQueryDto,
  SUPPORTED_ORDER_STATUSES,
  UpdateAdminOrderStatusDto,
} from './dto/admin-order.dto';

type AdminOrderWithDetails = Prisma.OrderGetPayload<{
  include: ReturnType<AdminOrdersService['orderInclude']>;
}>;

@Injectable()
export class AdminOrdersService {
  private readonly logger = new Logger(AdminOrdersService.name);

  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(NotificationsService)
    private readonly notificationsService: NotificationsService,
  ) {}

  async listOrders(query: ListAdminOrdersQueryDto) {
    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 20);
    const skip = (page - 1) * limit;
    const where = this.buildOrderWhere(query);
    const orderBy: Prisma.OrderOrderByWithRelationInput = {
      createdAt: query.sort === AdminOrderSort.Oldest ? 'asc' : 'desc',
    };

    const orders = await this.prisma.order.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: this.orderInclude(),
    });
    const total = await this.prisma.order.count({ where });

    return {
      data: orders.map((order) => this.serializeOrder(order)),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPreviousPage: page > 1,
      },
    };
  }

  async getOrder(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: this.orderInclude(),
    });

    if (!order) {
      throw new NotFoundException('Order not found.');
    }

    return this.serializeOrder(order);
  }

  async updateOrderStatus(id: string, dto: UpdateAdminOrderStatusDto) {
    if (!SUPPORTED_ORDER_STATUSES.includes(dto.status)) {
      throw new BadRequestException(INVALID_ORDER_STATUS_MESSAGE);
    }

    const existingOrder = await this.ensureOrderExists(id);

    if (existingOrder.status === dto.status) {
      return this.getOrder(id);
    }

    let order: AdminOrderWithDetails;

    try {
      order = await this.prisma.order.update({
        where: { id },
        data: {
          status: dto.status,
        },
        include: this.orderInclude(),
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientValidationError) {
        throw new BadRequestException(INVALID_ORDER_STATUS_MESSAGE);
      }

      throw error;
    }

    void this.notificationsService
      .handleOrderStatusTransition(order.id, existingOrder.status, order.status)
      .catch((error: unknown) => {
        this.logger.error(
          `Order status notification failed | orderId=${order.id} | previousStatus=${existingOrder.status} | nextStatus=${order.status} | error=${this.errorMessage(error)}`,
        );
      });

    return this.serializeOrder(order);
  }

  private errorMessage(error: unknown) {
    return error instanceof Error ? error.message : String(error);
  }

  private buildOrderWhere(query: ListAdminOrdersQueryDto): Prisma.OrderWhereInput {
    const and: Prisma.OrderWhereInput[] = [];

    if (query.status) {
      and.push({ status: query.status });
    }

    if (query.paymentStatus) {
      and.push({
        payment: {
          status: query.paymentStatus,
        },
      });
    }

    if (query.search?.trim()) {
      const search = query.search.trim();

      and.push({
        OR: [
          { id: { contains: search, mode: 'insensitive' } },
          { orderNumber: { contains: search, mode: 'insensitive' } },
          { customerName: { contains: search, mode: 'insensitive' } },
          { customerEmail: { contains: search, mode: 'insensitive' } },
        ],
      });
    }

    return and.length > 0 ? { AND: and } : {};
  }

  private async ensureOrderExists(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      select: { id: true, status: true },
    });

    if (!order) {
      throw new NotFoundException('Order not found.');
    }

    return order;
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
              color: true,
              size: true,
              images: {
                orderBy: {
                  sortOrder: 'asc',
                },
                select: {
                  id: true,
                  url: true,
                  altText: true,
                  sortOrder: true,
                  isPrimary: true,
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
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    } satisfies Prisma.OrderInclude;
  }

  private serializeOrder(order: AdminOrderWithDetails) {
    return {
      id: order.id,
      orderNumber: order.orderNumber,
      customer: {
        name: order.customerName,
        email: order.customerEmail,
        phone: order.customerPhone,
      },
      user: order.user,
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
            providerOrderId: order.payment.providerOrderId,
            providerPaymentId: order.payment.providerPaymentId,
            paidAt: order.payment.paidAt,
            createdAt: order.payment.createdAt,
            updatedAt: order.payment.updatedAt,
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
              color: item.product.color,
              size: item.product.size,
              images: item.product.images,
            }
          : null,
      })),
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };
  }
}
