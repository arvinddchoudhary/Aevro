import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  OrderStatus,
  PaymentProvider,
  PaymentStatus,
  Prisma,
  ProductStatus,
} from '@prisma/client';
import { createHmac, timingSafeEqual } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRazorpayOrderDto } from './dto/create-razorpay-order.dto';
import { VerifyRazorpayPaymentDto } from './dto/verify-razorpay-payment.dto';

type RazorpayOrderResponse = {
  id: string;
  amount: number;
  currency: string;
  receipt: string;
  status: string;
};

type PaymentWithOrder = Prisma.PaymentGetPayload<{
  include: {
    order: {
      select: {
        id: true;
        orderNumber: true;
        status: true;
      };
    };
  };
}>;

type PaymentForInventory = Prisma.PaymentGetPayload<{
  include: ReturnType<PaymentsService['paymentInventoryInclude']>;
}>;

@Injectable()
export class PaymentsService {
  private readonly razorpayKeyId: string;
  private readonly razorpayKeySecret: string;

  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(ConfigService) configService: ConfigService,
  ) {
    this.razorpayKeyId = configService.get<string>('RAZORPAY_KEY_ID') ?? '';
    this.razorpayKeySecret =
      configService.get<string>('RAZORPAY_KEY_SECRET') ?? '';
  }

  async createRazorpayOrder(dto: CreateRazorpayOrderDto) {
    this.assertRazorpayConfigured();

    const order = await this.prisma.order.findUnique({
      where: {
        id: dto.orderId,
      },
      include: {
        payment: true,
        items: {
          select: {
            productName: true,
            selectedColor: true,
            selectedSize: true,
            quantity: true,
            product: {
              select: {
                status: true,
                stock: true,
              },
            },
            variant: {
              select: {
                stock: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found.');
    }

    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException('Only pending orders can be paid.');
    }

    if (order.payment?.status === PaymentStatus.PAID) {
      throw new BadRequestException('Order is already paid.');
    }

    this.ensureOrderStockAvailable(order.items);

    if (order.payment?.providerOrderId && order.payment.status === PaymentStatus.PENDING) {
      return {
        keyId: this.razorpayKeyId,
        orderId: order.id,
        orderNumber: order.orderNumber,
        razorpayOrderId: order.payment.providerOrderId,
        amountInPaise: order.payment.amountInPaise,
        currency: order.payment.currency,
      };
    }

    const razorpayOrder = await this.createProviderOrder({
      amountInPaise: order.totalInPaise,
      currency: 'INR',
      receipt: order.orderNumber,
    });

    const payment = await this.prisma.payment.upsert({
      where: {
        orderId: order.id,
      },
      create: {
        orderId: order.id,
        provider: PaymentProvider.RAZORPAY,
        status: PaymentStatus.PENDING,
        amountInPaise: order.totalInPaise,
        currency: razorpayOrder.currency,
        providerOrderId: razorpayOrder.id,
      },
      update: {
        provider: PaymentProvider.RAZORPAY,
        status: PaymentStatus.PENDING,
        amountInPaise: order.totalInPaise,
        currency: razorpayOrder.currency,
        providerOrderId: razorpayOrder.id,
        providerPaymentId: null,
        providerSignature: null,
        paidAt: null,
      },
    });

    return {
      keyId: this.razorpayKeyId,
      orderId: order.id,
      orderNumber: order.orderNumber,
      razorpayOrderId: payment.providerOrderId,
      amountInPaise: payment.amountInPaise,
      currency: payment.currency,
    };
  }

  async verifyRazorpayPayment(dto: VerifyRazorpayPaymentDto) {
    this.assertRazorpayConfigured();

    const payment = await this.prisma.payment.findFirst({
      where: {
        orderId: dto.orderId,
        providerOrderId: dto.razorpayOrderId,
      },
      include: {
        order: {
          select: {
            id: true,
            orderNumber: true,
            status: true,
          },
        },
      },
    });

    if (!payment) {
      throw new NotFoundException('Payment record not found.');
    }

    if (payment.status === PaymentStatus.PAID) {
      return this.serializePayment(payment);
    }

    const isSignatureValid = this.verifySignature({
      razorpayOrderId: dto.razorpayOrderId,
      razorpayPaymentId: dto.razorpayPaymentId,
      razorpaySignature: dto.razorpaySignature,
    });

    if (!isSignatureValid) {
      await this.prisma.payment.update({
        where: {
          id: payment.id,
        },
        data: {
          status: PaymentStatus.FAILED,
          providerPaymentId: dto.razorpayPaymentId,
          providerSignature: dto.razorpaySignature,
        },
      });

      throw new BadRequestException('Payment verification failed.');
    }

    const updatedPayment = await this.prisma.$transaction(async (tx) => {
      const currentPayment = await tx.payment.findUnique({
        where: {
          id: payment.id,
        },
        include: this.paymentInventoryInclude(),
      });

      if (!currentPayment) {
        throw new NotFoundException('Payment record not found.');
      }

      if (currentPayment.status === PaymentStatus.PAID) {
        return this.findPaymentForResponse(tx, currentPayment.id);
      }

      if (currentPayment.order.status !== OrderStatus.PENDING) {
        throw new BadRequestException('Only pending orders can be paid.');
      }

      const paidAt = new Date();
      const paymentUpdate = await tx.payment.updateMany({
        where: {
          id: currentPayment.id,
          status: {
            not: PaymentStatus.PAID,
          },
        },
        data: {
          status: PaymentStatus.PAID,
          providerPaymentId: dto.razorpayPaymentId,
          providerSignature: dto.razorpaySignature,
          paidAt,
        },
      });

      if (paymentUpdate.count === 0) {
        return this.findPaymentForResponse(tx, currentPayment.id);
      }

      await this.deductOrderStock(tx, currentPayment);

      await tx.order.update({
        where: {
          id: currentPayment.orderId,
        },
        data: {
          status: OrderStatus.CONFIRMED,
        },
      });

      return this.findPaymentForResponse(tx, currentPayment.id);
    });

    return this.serializePayment(updatedPayment);
  }

  private async deductOrderStock(
    tx: Prisma.TransactionClient,
    payment: PaymentForInventory,
  ) {
    for (const item of payment.order.items) {
      if (item.variantId && item.productId) {
        const variantUpdate = await tx.productVariant.updateMany({
          where: {
            id: item.variantId,
            productId: item.productId,
            stock: {
              gte: item.quantity,
            },
          },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });

        if (variantUpdate.count !== 1) {
          throw new BadRequestException(
            `${item.productName} in ${item.selectedColor ?? 'selected colour'} / ${item.selectedSize ?? 'selected size'} no longer has enough stock.`,
          );
        }

        await this.decrementProductStock(tx, item.productId, item.quantity);
      } else if (item.productId) {
        const productOnlyUpdate = await tx.product.updateMany({
          where: {
            id: item.productId,
            status: ProductStatus.ACTIVE,
            stock: {
              gte: item.quantity,
            },
          },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });

        if (productOnlyUpdate.count !== 1) {
          throw new BadRequestException(
            `${item.productName} no longer has enough stock.`,
          );
        }
      } else {
        throw new BadRequestException(`${item.productName} is unavailable.`);
      }
    }
  }

  private async decrementProductStock(
    tx: Prisma.TransactionClient,
    productId: string,
    quantity: number,
  ) {
    const productUpdate = await tx.product.updateMany({
      where: {
        id: productId,
        status: ProductStatus.ACTIVE,
        stock: {
          gte: quantity,
        },
      },
      data: {
        stock: {
          decrement: quantity,
        },
      },
    });

    if (productUpdate.count !== 1) {
      throw new BadRequestException('Product stock is no longer available.');
    }
  }

  private ensureOrderStockAvailable(
    items: Array<{
      productName: string;
      selectedColor: string | null;
      selectedSize: string | null;
      quantity: number;
      product: {
        status: ProductStatus;
        stock: number;
      } | null;
      variant: {
        stock: number;
      } | null;
    }>,
  ) {
    items.forEach((item) => {
      if (!item.product || item.product.status !== ProductStatus.ACTIVE) {
        throw new BadRequestException(`${item.productName} is unavailable.`);
      }

      const availableStock = item.variant?.stock ?? item.product.stock;

      if (availableStock < item.quantity) {
        throw new BadRequestException(
          `${item.productName}${item.selectedColor || item.selectedSize ? ` in ${[item.selectedColor, item.selectedSize].filter(Boolean).join(' / ')}` : ''} has only ${availableStock} in stock.`,
        );
      }
    });
  }

  private async findPaymentForResponse(
    tx: Prisma.TransactionClient,
    paymentId: string,
  ) {
    const payment = await tx.payment.findUnique({
      where: {
        id: paymentId,
      },
      include: {
        order: {
          select: {
            id: true,
            orderNumber: true,
            status: true,
          },
        },
      },
    });

    if (!payment) {
      throw new NotFoundException('Payment record not found.');
    }

    return payment;
  }

  private paymentInventoryInclude() {
    return {
      order: {
        include: {
          items: {
            select: {
              id: true,
              productId: true,
              variantId: true,
              productName: true,
              selectedColor: true,
              selectedSize: true,
              quantity: true,
            },
          },
        },
      },
    } satisfies Prisma.PaymentInclude;
  }

  private async createProviderOrder(input: {
    amountInPaise: number;
    currency: string;
    receipt: string;
  }) {
    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(
          `${this.razorpayKeyId}:${this.razorpayKeySecret}`,
        ).toString('base64')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: input.amountInPaise,
        currency: input.currency,
        receipt: input.receipt,
      }),
    });

    if (!response.ok) {
      throw new BadRequestException('Unable to create Razorpay order.');
    }

    return (await response.json()) as RazorpayOrderResponse;
  }

  private assertRazorpayConfigured() {
    if (!this.razorpayKeyId || !this.razorpayKeySecret) {
      throw new ServiceUnavailableException('Razorpay is not configured.');
    }
  }

  private verifySignature(input: {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
  }) {
    const expectedSignature = createHmac('sha256', this.razorpayKeySecret)
      .update(`${input.razorpayOrderId}|${input.razorpayPaymentId}`)
      .digest('hex');

    const expectedBuffer = Buffer.from(expectedSignature);
    const receivedBuffer = Buffer.from(input.razorpaySignature);

    return (
      expectedBuffer.length === receivedBuffer.length &&
      timingSafeEqual(expectedBuffer, receivedBuffer)
    );
  }

  private serializePayment(payment: PaymentWithOrder) {
    return {
      id: payment.id,
      orderId: payment.orderId,
      orderNumber: payment.order.orderNumber,
      orderStatus: payment.order.status,
      status: payment.status,
      provider: payment.provider,
      amountInPaise: payment.amountInPaise,
      currency: payment.currency,
      razorpayOrderId: payment.providerOrderId,
      razorpayPaymentId: payment.providerPaymentId,
      paidAt: payment.paidAt,
      createdAt: payment.createdAt,
      updatedAt: payment.updatedAt,
    };
  }
}
