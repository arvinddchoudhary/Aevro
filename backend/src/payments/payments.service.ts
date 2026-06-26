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
  PaymentAttemptStatus,
  PaymentProvider,
  PaymentStatus,
  Prisma,
  ProductStatus,
  WebhookEventStatus,
} from '@prisma/client';
import { createHash, createHmac, timingSafeEqual } from 'crypto';
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

type RazorpayPaymentResponse = {
  id: string;
  order_id: string;
  amount: number;
  currency: string;
  status: string;
  captured?: boolean;
  error_code?: string | null;
  error_description?: string | null;
};

type RazorpayOrderPaymentsResponse = {
  items: RazorpayPaymentResponse[];
};

type RazorpayWebhookPayload = {
  event?: string;
  created_at?: number;
  payload?: {
    payment?: {
      entity?: RazorpayPaymentResponse;
    };
    order?: {
      entity?: {
        id?: string;
        amount?: number;
        currency?: string;
        status?: string;
      };
    };
  };
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
  private readonly razorpayWebhookSecret: string;

  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(ConfigService) configService: ConfigService,
  ) {
    this.razorpayKeyId = configService.get<string>('RAZORPAY_KEY_ID') ?? '';
    this.razorpayKeySecret =
      configService.get<string>('RAZORPAY_KEY_SECRET') ?? '';
    this.razorpayWebhookSecret =
      configService.get<string>('RAZORPAY_WEBHOOK_SECRET') ?? '';
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

    if (order.idempotencyKey && order.idempotencyKey !== dto.idempotencyKey) {
      throw new BadRequestException('Order idempotency key mismatch.');
    }

    if (!order.idempotencyKey) {
      await this.prisma.order.update({
        where: {
          id: order.id,
        },
        data: {
          idempotencyKey: dto.idempotencyKey,
        },
      });
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

    await this.prisma.paymentAttempt.create({
      data: {
        paymentId: payment.id,
        providerOrderId: razorpayOrder.id,
        status: PaymentAttemptStatus.CREATED,
        amountInPaise: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        rawStatus: razorpayOrder.status,
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

    const isSignatureValid = this.verifyCheckoutSignature({
      razorpayOrderId: dto.razorpayOrderId,
      razorpayPaymentId: dto.razorpayPaymentId,
      razorpaySignature: dto.razorpaySignature,
    });

    if (!isSignatureValid) {
      await this.recordPaymentAttempt(payment.id, {
        providerOrderId: dto.razorpayOrderId,
        providerPaymentId: dto.razorpayPaymentId,
        status: PaymentAttemptStatus.FAILED,
        rawStatus: 'invalid_signature',
        errorDescription: 'Razorpay checkout signature did not match.',
      });
      await this.markPaymentFailedIfPending(payment.id, dto.razorpayPaymentId, dto.razorpaySignature);

      throw new BadRequestException('Payment verification failed.');
    }

    const razorpayPayment = await this.fetchProviderPayment(dto.razorpayPaymentId);
    this.assertProviderPaymentMatchesLocal(payment, razorpayPayment, dto.razorpayOrderId);
    this.assertProviderPaymentCaptured(razorpayPayment);

    await this.recordPaymentAttempt(payment.id, {
      providerOrderId: dto.razorpayOrderId,
      providerPaymentId: dto.razorpayPaymentId,
      status: PaymentAttemptStatus.VERIFIED,
      amountInPaise: razorpayPayment.amount,
      currency: razorpayPayment.currency,
      rawStatus: razorpayPayment.status,
    });

    const updatedPayment = await this.markPaymentSuccessful(payment.id, {
      providerPaymentId: dto.razorpayPaymentId,
      providerSignature: dto.razorpaySignature,
    });

    return this.serializePayment(updatedPayment);
  }

  async processRazorpayWebhook(input: {
    rawBody: string;
    signature: string;
    eventId?: string;
  }) {
    this.assertRazorpayWebhookConfigured();

    if (!this.verifyWebhookSignature(input.rawBody, input.signature)) {
      throw new BadRequestException('Invalid Razorpay webhook signature.');
    }

    const payload = JSON.parse(input.rawBody) as RazorpayWebhookPayload;
    const eventType = payload.event ?? 'unknown';
    const eventId =
      input.eventId ??
      createHash('sha256').update(input.rawBody).digest('hex');

    let webhookEventId: string | null = null;

    try {
      const webhookEvent = await this.prisma.webhookEvent.create({
        data: {
          eventId,
          eventType,
          signature: input.signature,
          payload: payload as Prisma.InputJsonValue,
          status: WebhookEventStatus.RECEIVED,
        },
      });

      webhookEventId = webhookEvent.id;
    } catch (error) {
      if (this.isUniqueConstraintError(error)) {
        return {
          received: true,
          duplicate: true,
          eventId,
        };
      }

      throw error;
    }

    try {
      const result = await this.processVerifiedWebhookPayload(eventType, payload);

      await this.prisma.webhookEvent.update({
        where: {
          id: webhookEventId,
        },
        data: {
          status: result.processed ? WebhookEventStatus.PROCESSED : WebhookEventStatus.IGNORED,
          processedAt: new Date(),
        },
      });

      return {
        received: true,
        duplicate: false,
        eventId,
        processed: result.processed,
      };
    } catch (error) {
      await this.prisma.webhookEvent.update({
        where: {
          id: webhookEventId,
        },
        data: {
          status: WebhookEventStatus.FAILED,
          errorMessage:
            error instanceof Error ? error.message : 'Webhook processing failed.',
        },
      });

      throw error;
    }
  }

  private async processVerifiedWebhookPayload(
    eventType: string,
    payload: RazorpayWebhookPayload,
  ) {
    if (
      eventType !== 'payment.captured' &&
      eventType !== 'order.paid' &&
      eventType !== 'payment.failed'
    ) {
      return {
        processed: false,
      };
    }

    const paymentEntity = payload.payload?.payment?.entity;
    const providerOrderId = paymentEntity?.order_id ?? payload.payload?.order?.entity?.id;

    if (!providerOrderId) {
      return {
        processed: false,
      };
    }

    const payment = await this.prisma.payment.findFirst({
      where: {
        providerOrderId,
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
      return {
        processed: false,
      };
    }

    if (eventType === 'payment.failed') {
      await this.recordPaymentAttempt(payment.id, {
        providerOrderId,
        providerPaymentId: paymentEntity?.id,
        status: PaymentAttemptStatus.FAILED,
        amountInPaise: paymentEntity?.amount,
        currency: paymentEntity?.currency,
        rawStatus: paymentEntity?.status ?? 'failed',
        errorCode: paymentEntity?.error_code ?? undefined,
        errorDescription: paymentEntity?.error_description ?? undefined,
      });
      await this.markPaymentFailedIfPending(payment.id, paymentEntity?.id);

      return {
        processed: true,
      };
    }

    const razorpayPayment = paymentEntity?.id
      ? await this.fetchProviderPayment(paymentEntity.id)
      : await this.fetchCapturedProviderPaymentForOrder(providerOrderId);

    if (!razorpayPayment) {
      return {
        processed: false,
      };
    }

    this.assertProviderPaymentMatchesLocal(payment, razorpayPayment, providerOrderId);
    this.assertProviderPaymentCaptured(razorpayPayment);

    await this.recordPaymentAttempt(payment.id, {
      providerOrderId,
      providerPaymentId: razorpayPayment.id,
      status: PaymentAttemptStatus.CAPTURED,
      amountInPaise: razorpayPayment.amount,
      currency: razorpayPayment.currency,
      rawStatus: razorpayPayment.status,
    });

    await this.markPaymentSuccessful(payment.id, {
      providerPaymentId: razorpayPayment.id,
    });

    return {
      processed: true,
    };
  }

  private async markPaymentSuccessful(
    paymentId: string,
    input: {
      providerPaymentId: string;
      providerSignature?: string;
    },
  ) {
    return this.prisma.$transaction(async (tx) => {
      const currentPayment = await tx.payment.findUnique({
        where: {
          id: paymentId,
        },
        include: this.paymentInventoryInclude(),
      });

      if (!currentPayment) {
        throw new NotFoundException('Payment record not found.');
      }

      if (
        currentPayment.status !== PaymentStatus.PAID &&
        currentPayment.order.status !== OrderStatus.PENDING
      ) {
        throw new BadRequestException('Only pending orders can be paid.');
      }

      const paidAt = currentPayment.paidAt ?? new Date();
      const stockClaim = await tx.payment.updateMany({
        where: {
          id: currentPayment.id,
          stockDeductedAt: null,
        },
        data: {
          stockDeductedAt: paidAt,
        },
      });

      if (stockClaim.count === 1) {
        await this.deductOrderStock(tx, currentPayment);
      }

      await tx.payment.update({
        where: {
          id: currentPayment.id,
        },
        data: {
          status: PaymentStatus.PAID,
          providerPaymentId: input.providerPaymentId,
          providerSignature: input.providerSignature ?? currentPayment.providerSignature,
          paidAt,
        },
      });

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
        Authorization: this.basicAuthHeader(),
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

  private async fetchProviderPayment(razorpayPaymentId: string) {
    const response = await fetch(
      `https://api.razorpay.com/v1/payments/${encodeURIComponent(razorpayPaymentId)}`,
      {
        headers: {
          Authorization: this.basicAuthHeader(),
        },
      },
    );

    if (!response.ok) {
      throw new BadRequestException('Unable to verify Razorpay payment status.');
    }

    return (await response.json()) as RazorpayPaymentResponse;
  }

  private async fetchCapturedProviderPaymentForOrder(razorpayOrderId: string) {
    const response = await fetch(
      `https://api.razorpay.com/v1/orders/${encodeURIComponent(razorpayOrderId)}/payments`,
      {
        headers: {
          Authorization: this.basicAuthHeader(),
        },
      },
    );

    if (!response.ok) {
      throw new BadRequestException('Unable to verify Razorpay order payment status.');
    }

    const payload = (await response.json()) as RazorpayOrderPaymentsResponse;

    return payload.items.find((item) => item.status === 'captured') ?? null;
  }

  private assertProviderPaymentMatchesLocal(
    payment: PaymentWithOrder,
    razorpayPayment: RazorpayPaymentResponse,
    razorpayOrderId: string,
  ) {
    if (razorpayPayment.order_id !== razorpayOrderId) {
      throw new BadRequestException('Razorpay order id mismatch.');
    }

    if (payment.providerOrderId !== razorpayPayment.order_id) {
      throw new BadRequestException('Payment record does not match Razorpay order.');
    }

    if (payment.amountInPaise !== razorpayPayment.amount) {
      throw new BadRequestException('Payment amount mismatch.');
    }

    if (payment.currency.toUpperCase() !== razorpayPayment.currency.toUpperCase()) {
      throw new BadRequestException('Payment currency mismatch.');
    }
  }

  private assertProviderPaymentCaptured(razorpayPayment: RazorpayPaymentResponse) {
    if (razorpayPayment.status !== 'captured') {
      throw new BadRequestException('Razorpay payment is not captured.');
    }
  }

  private async recordPaymentAttempt(
    paymentId: string,
    input: {
      providerOrderId?: string;
      providerPaymentId?: string;
      status: PaymentAttemptStatus;
      amountInPaise?: number;
      currency?: string;
      rawStatus?: string;
      errorCode?: string;
      errorDescription?: string;
    },
  ) {
    const data = {
      paymentId,
      provider: PaymentProvider.RAZORPAY,
      providerOrderId: input.providerOrderId,
      providerPaymentId: input.providerPaymentId,
      status: input.status,
      amountInPaise: input.amountInPaise,
      currency: input.currency,
      rawStatus: input.rawStatus,
      errorCode: input.errorCode,
      errorDescription: input.errorDescription,
    };

    if (input.providerPaymentId) {
      await this.prisma.paymentAttempt.upsert({
        where: {
          providerPaymentId: input.providerPaymentId,
        },
        create: data,
        update: data,
      });
      return;
    }

    await this.prisma.paymentAttempt.create({
      data,
    });
  }

  private async markPaymentFailedIfPending(
    paymentId: string,
    providerPaymentId?: string,
    providerSignature?: string,
  ) {
    await this.prisma.payment.updateMany({
      where: {
        id: paymentId,
        status: {
          not: PaymentStatus.PAID,
        },
      },
      data: {
        status: PaymentStatus.FAILED,
        providerPaymentId,
        providerSignature,
      },
    });
  }

  private assertRazorpayConfigured() {
    if (!this.razorpayKeyId || !this.razorpayKeySecret) {
      throw new ServiceUnavailableException('Razorpay is not configured.');
    }
  }

  private assertRazorpayWebhookConfigured() {
    if (!this.razorpayWebhookSecret) {
      throw new ServiceUnavailableException('Razorpay webhook is not configured.');
    }
  }

  private basicAuthHeader() {
    return `Basic ${Buffer.from(
      `${this.razorpayKeyId}:${this.razorpayKeySecret}`,
    ).toString('base64')}`;
  }

  private verifyCheckoutSignature(input: {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
  }) {
    const expectedSignature = createHmac('sha256', this.razorpayKeySecret)
      .update(`${input.razorpayOrderId}|${input.razorpayPaymentId}`)
      .digest('hex');

    return this.safeCompare(expectedSignature, input.razorpaySignature);
  }

  private verifyWebhookSignature(rawBody: string, signature: string) {
    const expectedSignature = createHmac('sha256', this.razorpayWebhookSecret)
      .update(rawBody)
      .digest('hex');

    return this.safeCompare(expectedSignature, signature);
  }

  private safeCompare(expected: string, received: string) {
    const expectedBuffer = Buffer.from(expected);
    const receivedBuffer = Buffer.from(received);

    return (
      expectedBuffer.length === receivedBuffer.length &&
      timingSafeEqual(expectedBuffer, receivedBuffer)
    );
  }

  private isUniqueConstraintError(error: unknown) {
    return (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
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
