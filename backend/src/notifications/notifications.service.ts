import {
  Inject,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  EmailEventType,
  EmailNotificationStatus,
  OrderStatus,
  PaymentStatus,
  Prisma,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { BrevoService } from './brevo.service';

type EmailOrder = Prisma.OrderGetPayload<{
  include: ReturnType<NotificationsService['orderEmailInclude']>;
}>;

type BrevoWebhookPayload = {
  event?: string;
  email?: string;
  date?: string | number;
  ts?: number;
  reason?: string;
  subject?: string;
  id?: number;
  'message-id'?: string;
  messageId?: string;
};

type NotificationRequest = {
  eventType: EmailEventType;
  order: EmailOrder;
  recipientEmail: string;
  recipientName?: string | null;
  subject: string;
  idempotencyKey: string;
  params: Record<string, unknown>;
};

type EmailVerificationOtpInput = {
  user: {
    id?: string;
    name: string;
    email: string;
  };
  code: string;
  expiresInMinutes: number;
};

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private readonly adminOrderEmail: string;
  private readonly supportEmail: string;
  private readonly frontendUrl: string;

  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(BrevoService) private readonly brevoService: BrevoService,
    @Inject(ConfigService) configService: ConfigService,
  ) {
    this.adminOrderEmail =
      configService.get<string>('AEVRO_ADMIN_EMAIL') ??
      configService.get<string>('ADMIN_ORDER_NOTIFICATION_EMAIL') ??
      '';
    this.supportEmail =
      configService.get<string>('AEVRO_SUPPORT_EMAIL') ??
      configService.get<string>('BREVO_REPLY_TO_EMAIL') ??
      'support@aevro.com';
    this.frontendUrl =
      configService.get<string>('FRONTEND_URL') ?? 'http://localhost:3000';
  }

  async handleOrderPaid(orderId: string) {
    const order = await this.findOrderForEmail(orderId);

    if (!order) {
      this.logger.warn(`Order paid email skipped | orderId=${orderId} | reason=order_not_found`);
      return;
    }

    if (order.payment?.status !== PaymentStatus.PAID) {
      this.logger.warn(
        `Order paid email skipped | orderId=${orderId} | orderNumber=${order.orderNumber} | paymentStatus=${order.payment?.status ?? 'missing'}`,
      );
      return;
    }

    const results = await Promise.allSettled([
      this.createAndSendOnce({
        eventType: EmailEventType.ORDER_CONFIRMED_CUSTOMER,
        order,
        recipientEmail: order.customerEmail,
        recipientName: order.customerName,
        subject: `AEVRO order confirmed: ${order.orderNumber}`,
        idempotencyKey: `ORDER_CONFIRMED_CUSTOMER:${order.id}:${order.customerEmail}`,
        params: this.buildCustomerOrderParams(order),
      }),
      this.adminOrderEmail
        ? this.createAndSendOnce({
            eventType: EmailEventType.ORDER_CONFIRMED_ADMIN,
            order,
            recipientEmail: this.adminOrderEmail,
            recipientName: 'AEVRO Admin',
            subject: `New paid order: ${order.orderNumber}`,
            idempotencyKey: `ORDER_CONFIRMED_ADMIN:${order.id}:${this.adminOrderEmail}`,
            params: this.buildAdminOrderParams(order),
          })
        : Promise.resolve(),
    ]);

    results.forEach((result, index) => {
      const target = index === 0 ? 'customer' : 'admin';

      if (result.status === 'rejected') {
        this.logger.error(
          `Order paid email task failed | orderId=${order.id} | orderNumber=${order.orderNumber} | target=${target} | error=${this.errorMessage(result.reason)}`,
        );
      }
    });
  }

  async sendEmailVerificationOtp(input: EmailVerificationOtpInput) {
    const eventType = EmailEventType.EMAIL_VERIFICATION_OTP;
    const templateId = this.brevoService.getTemplateIdForEvent(eventType);
    const subject = `${input.code} is your AEVRO verification code`;

    if (!templateId) {
      this.logger.error(
        `Email verification OTP skipped | userId=${input.user.id} | to=${input.user.email} | reason=missing_template`,
      );
      throw new ServiceUnavailableException(
        'Email verification email is not configured. Set BREVO_TEMPLATE_EMAIL_VERIFICATION_OTP.',
      );
    }

    const notification = await this.prisma.emailNotification.create({
      data: {
        userId: input.user.id,
        eventType,
        recipientEmail: input.user.email,
        recipientName: input.user.name,
        subject,
        idempotencyKey: `${eventType}:${input.user.id}:${Date.now()}`,
      },
      select: {
        id: true,
      },
    });

    try {
      const result = await this.brevoService.sendTemplateEmail({
        recipientEmail: input.user.email,
        recipientName: input.user.name,
        subject,
        templateId,
        params: {
          customerName: input.user.name,
          otpCode: input.code,
          verificationCode: input.code,
          expiresInMinutes: input.expiresInMinutes,
          supportEmail: this.supportEmail,
        },
      });

      await this.prisma.emailNotification.update({
        where: {
          id: notification.id,
        },
        data: {
          status: EmailNotificationStatus.SENT,
          brevoMessageId: result.messageId,
          sentAt: new Date(),
          errorMessage: null,
        },
      });
    } catch (error) {
      const message = this.errorMessage(error);
      this.logger.error(
        `Email verification OTP failed | userId=${input.user.id} | to=${input.user.email} | error=${message}`,
      );
      await this.markNotificationFailed(notification.id, message);
      throw new ServiceUnavailableException(
        'Verification email could not be sent. Please try again.',
      );
    }
  }

  async handlePaymentFailed(orderId: string) {
    const order = await this.findOrderForEmail(orderId);

    if (!order) {
      return;
    }

    await this.createAndSendOnce({
      eventType: EmailEventType.PAYMENT_FAILED,
      order,
      recipientEmail: order.customerEmail,
      recipientName: order.customerName,
      subject: `Payment failed for AEVRO order ${order.orderNumber}`,
      idempotencyKey: `PAYMENT_FAILED:${order.id}:${order.customerEmail}`,
      params: this.buildCustomerOrderParams(order),
    });
  }

  async handleOrderStatusTransition(
    orderId: string,
    previousStatus: OrderStatus,
    nextStatus: OrderStatus,
  ) {
    if (previousStatus === nextStatus) {
      return;
    }

    if (nextStatus !== OrderStatus.SHIPPED && nextStatus !== OrderStatus.DELIVERED) {
      return;
    }

    const order = await this.findOrderForEmail(orderId);

    if (!order) {
      return;
    }

    const eventType =
      nextStatus === OrderStatus.SHIPPED
        ? EmailEventType.ORDER_SHIPPED
        : EmailEventType.ORDER_DELIVERED;
    const label = nextStatus === OrderStatus.SHIPPED ? 'shipped' : 'delivered';

    await this.createAndSendOnce({
      eventType,
      order,
      recipientEmail: order.customerEmail,
      recipientName: order.customerName,
      subject: `Your AEVRO order has been ${label}: ${order.orderNumber}`,
      idempotencyKey: `${eventType}:${order.id}:${order.customerEmail}`,
      params: this.buildCustomerOrderParams(order),
    });
  }

  async processBrevoWebhook(payload: Record<string, unknown>) {
    const eventPayload = payload as BrevoWebhookPayload;
    const event = eventPayload.event?.toLowerCase();
    const email = eventPayload.email;
    const messageId = eventPayload['message-id'] ?? eventPayload.messageId;

    if (!event || (!messageId && !email)) {
      return {
        received: true,
        updated: false,
      };
    }

    const notification = await this.prisma.emailNotification.findFirst({
      where: {
        AND: [
          messageId ? { brevoMessageId: messageId } : {},
          email ? { recipientEmail: email } : {},
        ],
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!notification) {
      return {
        received: true,
        updated: false,
      };
    }

    const status = this.mapBrevoEventToStatus(event);
    if (!status) {
      return {
        received: true,
        updated: false,
      };
    }

    const eventDate = this.parseBrevoDate(eventPayload);
    await this.prisma.emailNotification.update({
      where: {
        id: notification.id,
      },
      data: {
        status,
        sentAt:
          status === EmailNotificationStatus.SENT
            ? eventDate
            : notification.sentAt,
        deliveredAt:
          status === EmailNotificationStatus.DELIVERED
            ? eventDate
            : notification.deliveredAt,
        failedAt:
          status === EmailNotificationStatus.BOUNCED ||
          status === EmailNotificationStatus.FAILED
            ? eventDate
            : notification.failedAt,
        errorMessage:
          status === EmailNotificationStatus.BOUNCED ||
          status === EmailNotificationStatus.FAILED
            ? eventPayload.reason ?? eventPayload.event ?? null
            : notification.errorMessage,
      },
    });

    return {
      received: true,
      updated: true,
    };
  }

  private async createAndSendOnce(input: NotificationRequest) {
    const templateId = this.brevoService.getTemplateIdForEvent(input.eventType);
    let notification: { id: string } | null = null;

    try {
      notification = await this.prisma.emailNotification.create({
        data: {
          orderId: input.order.id,
          userId: input.order.userId,
          eventType: input.eventType,
          recipientEmail: input.recipientEmail,
          recipientName: input.recipientName,
          subject: input.subject,
          idempotencyKey: input.idempotencyKey,
        },
      });
    } catch (error) {
      if (!this.isUniqueConstraintError(error)) {
        this.logger.error(this.errorMessage(error));
        return;
      }

      const existingNotification = await this.prisma.emailNotification.findUnique({
        where: {
          idempotencyKey: input.idempotencyKey,
        },
        select: {
          id: true,
          status: true,
        },
      });

      if (!existingNotification) {
        this.logger.warn(
          `Email notification duplicate found but not readable | event=${input.eventType} | order=${input.order.orderNumber} | to=${input.recipientEmail}`,
        );
        return;
      }

      if (existingNotification.status !== EmailNotificationStatus.FAILED) {
        return;
      }

      notification = await this.prisma.emailNotification.update({
        where: {
          id: existingNotification.id,
        },
        data: {
          status: EmailNotificationStatus.PENDING,
          recipientEmail: input.recipientEmail,
          recipientName: input.recipientName,
          subject: input.subject,
          brevoMessageId: null,
          errorMessage: null,
          sentAt: null,
          deliveredAt: null,
          failedAt: null,
        },
        select: {
          id: true,
        },
      });
    }

    if (!notification) {
      return;
    }

    if (!templateId) {
      this.logger.error(
        `Email notification missing template | event=${input.eventType} | order=${input.order.orderNumber} | to=${input.recipientEmail}`,
      );
      await this.markNotificationFailed(
        notification.id,
        `Missing Brevo template id for ${input.eventType}.`,
      );
      return;
    }

    try {
      const result = await this.brevoService.sendTemplateEmail({
        recipientEmail: input.recipientEmail,
        recipientName: input.recipientName,
        subject: input.subject,
        templateId,
        params: input.params,
      });

      await this.prisma.emailNotification.update({
        where: {
          id: notification.id,
        },
        data: {
          status: EmailNotificationStatus.SENT,
          brevoMessageId: result.messageId,
          sentAt: new Date(),
          errorMessage: null,
        },
      });

    } catch (error) {
      const message = this.errorMessage(error);
      this.logger.error(
        `Email notification failed | event=${input.eventType} | order=${input.order.orderNumber} | to=${input.recipientEmail} | error=${message}`,
      );

      if (notification) {
        await this.markNotificationFailed(notification.id, message);
      }
    }
  }

  private async markNotificationFailed(id: string, message: string) {
    await this.prisma.emailNotification.update({
      where: {
        id,
      },
      data: {
        status: EmailNotificationStatus.FAILED,
        errorMessage: message,
        failedAt: new Date(),
      },
    });
  }

  private async findOrderForEmail(orderId: string) {
    return this.prisma.order.findUnique({
      where: {
        id: orderId,
      },
      include: this.orderEmailInclude(),
    });
  }

  private orderEmailInclude() {
    return {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      payment: true,
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          variant: {
            select: {
              id: true,
              colorName: true,
              size: true,
              sku: true,
            },
          },
        },
      },
    } satisfies Prisma.OrderInclude;
  }

  private buildCustomerOrderParams(order: EmailOrder) {
    const total = this.formatPaise(order.totalInPaise);
    const paymentStatus = order.payment?.status ?? PaymentStatus.PENDING;

    return {
      customerName: order.customerName,
      orderNumber: order.orderNumber,
      orderId: order.id,
      paymentStatus,
      paymentStatusText: paymentStatus,
      orderDate: order.createdAt.toISOString(),
      orderDateText: this.formatDate(order.createdAt),
      items: this.buildItems(order),
      itemsText: this.buildItemsText(order),
      totalPaid: total,
      orderTotal: total,
      shippingAddress: this.buildShippingAddress(order),
      shippingAddressText: this.buildShippingAddressText(order),
      estimatedDelivery: '5-7 business days',
      orderUrl: `${this.frontendUrl}/account/orders/${order.id}`,
      supportEmail: this.supportEmail,
    };
  }

  private buildAdminOrderParams(order: EmailOrder) {
    const total = this.formatPaise(order.totalInPaise);
    const paymentStatus = order.payment?.status ?? PaymentStatus.PENDING;
    const adminOrderUrl = `${this.frontendUrl}/admin/orders/${order.id}`;

    return {
      orderNumber: order.orderNumber,
      orderId: order.id,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      customerPhone: order.customerPhone,
      customerPhoneText: order.customerPhone || 'Not provided',
      orderDate: order.createdAt.toISOString(),
      orderDateText: this.formatDate(order.createdAt),
      items: this.buildItems(order),
      itemsText: this.buildItemsText(order),
      total,
      totalPaid: total,
      orderTotal: total,
      paymentStatus,
      paymentStatusText: paymentStatus,
      paymentMethod: order.payment?.provider ?? 'RAZORPAY',
      shippingAddress: this.buildShippingAddress(order),
      shippingAddressText: this.buildShippingAddressText(order),
      adminOrderUrl,
      orderUrl: adminOrderUrl,
      supportEmail: this.supportEmail,
    };
  }

  private buildItems(order: EmailOrder) {
    return order.items.map((item) => ({
      name: item.productName,
      slug: item.productSlug ?? item.product?.slug,
      quantity: item.quantity,
      color: item.selectedColor ?? item.variant?.colorName,
      size: item.selectedSize ?? item.variant?.size,
      sku: item.variant?.sku,
      unitPrice: this.formatPaise(item.unitPriceInPaise),
      lineTotal: this.formatPaise(item.lineTotalInPaise),
    }));
  }

  private buildShippingAddress(order: EmailOrder) {
    return {
      addressLine: order.shippingAddress,
      city: order.shippingCity,
      state: order.shippingState,
      postalCode: order.shippingPincode,
      country: order.shippingCountry,
      formatted: [
        order.shippingAddress,
        order.shippingCity,
        order.shippingState,
        order.shippingPincode,
        order.shippingCountry,
      ]
        .filter(Boolean)
        .join(', '),
    };
  }

  private buildItemsText(order: EmailOrder) {
    if (order.items.length === 0) {
      return 'No items found.';
    }

    return order.items
      .map((item, index) => {
        const color = item.selectedColor ?? item.variant?.colorName;
        const size = item.selectedSize ?? item.variant?.size;
        const variantParts = [color, size ? `Size ${size}` : null].filter(Boolean).join(' / ');
        const variantText = variantParts ? ` (${variantParts})` : '';

        return `${index + 1}. ${item.productName}${variantText} - Qty ${item.quantity} - ${this.formatPaise(item.lineTotalInPaise)}`;
      })
      .join('\n');
  }

  private buildShippingAddressText(order: EmailOrder) {
    return [
      order.shippingAddress,
      [order.shippingCity, order.shippingState].filter(Boolean).join(', '),
      [order.shippingPincode, order.shippingCountry].filter(Boolean).join(', '),
    ]
      .filter(Boolean)
      .join('\n');
  }

  private formatDate(date: Date) {
    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(date);
  }

  private formatPaise(amountInPaise: number) {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amountInPaise / 100);
  }

  private mapBrevoEventToStatus(event: string) {
    if (event === 'sent') {
      return EmailNotificationStatus.SENT;
    }

    if (event === 'delivered') {
      return EmailNotificationStatus.DELIVERED;
    }

    if (event === 'soft_bounce' || event === 'hard_bounce') {
      return EmailNotificationStatus.BOUNCED;
    }

    if (event === 'error' || event === 'blocked' || event === 'invalid') {
      return EmailNotificationStatus.FAILED;
    }

    return null;
  }

  private parseBrevoDate(payload: BrevoWebhookPayload) {
    if (payload.date) {
      const date = new Date(payload.date);
      if (!Number.isNaN(date.getTime())) {
        return date;
      }
    }

    if (payload.ts) {
      return new Date(payload.ts * 1000);
    }

    return new Date();
  }

  private errorMessage(error: unknown) {
    return error instanceof Error ? error.message : 'Email notification failed.';
  }

  private isUniqueConstraintError(error: unknown) {
    return (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    );
  }
}
