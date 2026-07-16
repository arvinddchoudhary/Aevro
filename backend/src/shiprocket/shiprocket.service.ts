import {
  BadGatewayException,
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  OrderStatus,
  PaymentStatus,
  Prisma,
  Shipment,
  ShipmentProvider,
  ShipmentStatus,
  UserRole,
  WebhookEventStatus,
} from '@prisma/client';
import { createHash, timingSafeEqual } from 'node:crypto';
import { NotificationsService } from '../notifications/notifications.service';
import { PrismaService } from '../prisma/prisma.service';
import { AssignAwbDto } from './dto/assign-awb.dto';
import { SchedulePickupDto } from './dto/schedule-pickup.dto';
import {
  mapShiprocketStatus,
  orderStatusForShipment,
} from './mappers/shiprocket-status.mapper';
import { ShiprocketClient } from './shiprocket.client';
import {
  JsonRecord,
  NormalizedShiprocketTracking,
  ShiprocketCourierRate,
  ShiprocketCreateOrderPayload,
  ShiprocketProviderError,
  ShiprocketTrackingEvent,
} from './shiprocket.types';

const CANCELLABLE_STATUSES = new Set<ShipmentStatus>([
  ShipmentStatus.CREATED,
  ShipmentStatus.AWB_ASSIGNED,
  ShipmentStatus.PICKUP_SCHEDULED,
]);
const STALE_CREATION_LOCK_MS = 2 * 60 * 1000;

@Injectable()
export class ShiprocketService {
  private readonly logger = new Logger(ShiprocketService.name);

  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(ConfigService) private readonly config: ConfigService,
    @Inject(ShiprocketClient) private readonly client: ShiprocketClient,
    @Inject(NotificationsService)
    private readonly notifications: NotificationsService,
  ) {}

  async getAdminShipment(orderId: string) {
    await this.ensureOrderExists(orderId);
    const shipment = await this.prisma.shipment.findUnique({ where: { orderId } });
    return {
      enabled: this.isEnabled(),
      shipment: shipment ? this.serializeAdminShipment(shipment) : null,
    };
  }

  async createShipment(orderId: string) {
    this.assertEnabledAndConfigured();
    const order = await this.getShippableOrder(orderId);
    const dimensions = this.defaultDimensions();
    let shipment = await this.prisma.shipment.findUnique({ where: { orderId } });

    if (shipment && shipment.status !== ShipmentStatus.FAILED) {
      const stalePendingOperation =
        shipment.status === ShipmentStatus.PENDING &&
        shipment.updatedAt.getTime() <= Date.now() - STALE_CREATION_LOCK_MS;

      if (!stalePendingOperation) {
        throw new ConflictException('A Shiprocket shipment already exists for this order.');
      }
    }

    if (!shipment) {
      try {
        shipment = await this.prisma.shipment.create({
          data: {
            orderId,
            provider: ShipmentProvider.SHIPROCKET,
            pickupLocation: this.pickupLocation(),
            status: ShipmentStatus.PENDING,
            statusLabel: 'Creating shipment',
            ...dimensions,
          },
        });
      } catch (error) {
        if (this.isUniqueConstraintError(error)) {
          throw new ConflictException('A shipment operation is already in progress for this order.');
        }
        throw error;
      }
    } else {
      shipment = await this.prisma.shipment.update({
        where: { id: shipment.id },
        data: {
          status: ShipmentStatus.PENDING,
          statusLabel: 'Retrying shipment creation',
          rawProviderResponse: Prisma.JsonNull,
          ...dimensions,
        },
      });
    }

    try {
      const reconciled = await this.findExistingProviderOrder(order.orderNumber);
      const response = reconciled ?? (await this.client.createOrder(this.buildCreatePayload(order)));
      const responseRecord = this.recordValue(response);
      const providerOrderId = this.stringValue(responseRecord.order_id ?? responseRecord.id);
      const providerShipmentId = this.extractShipmentId(responseRecord);

      if (!providerOrderId || !providerShipmentId) {
        throw new ShiprocketProviderError(
          'Shiprocket did not return the required order and shipment identifiers.',
        );
      }

      const updated = await this.prisma.shipment.update({
        where: { id: shipment.id },
        data: {
          providerOrderId,
          providerShipmentId,
          status: ShipmentStatus.CREATED,
          statusLabel: 'Shipment created',
          statusHistory: this.json([
            {
              status: ShipmentStatus.CREATED,
              statusLabel: 'Shipment created',
              occurredAt: new Date().toISOString(),
              activity: 'Order created in Shiprocket',
              location: null,
            },
          ]),
          rawProviderResponse: this.json(responseRecord),
          lastSyncedAt: new Date(),
        },
      });

      await this.syncOrderStatus(orderId, ShipmentStatus.CREATED);
      return this.serializeAdminShipment(updated);
    } catch (error) {
      await this.recordFailure(shipment.id, 'Shipment creation failed', error);
      throw this.toHttpException(error, 'Unable to create the Shiprocket shipment.');
    }
  }

  async getRates(orderId: string) {
    this.assertEnabledAndConfigured();
    const order = await this.getShippableOrder(orderId, false);
    const pickupPostcode = await this.resolvePickupPostcode();
    const dimensions = this.defaultDimensions();

    try {
      const response = await this.client.getServiceability({
        pickup_postcode: pickupPostcode,
        delivery_postcode: order.shippingPincode,
        cod: 0,
        weight: dimensions.weightKg,
        length: dimensions.lengthCm,
        breadth: dimensions.breadthCm,
        height: dimensions.heightCm,
        declared_value: Number((order.totalInPaise / 100).toFixed(2)),
      });
      const rates = this.extractCourierRates(response);

      if (rates.length === 0) {
        throw new BadRequestException('No prepaid courier service is available for this order.');
      }

      return rates;
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw this.toHttpException(error, 'Unable to load Shiprocket courier rates.');
    }
  }

  async assignAwb(orderId: string, dto: AssignAwbDto) {
    this.assertEnabledAndConfigured();
    const shipment = await this.requireShipment(orderId);

    if (shipment.awbCode) {
      return this.serializeAdminShipment(shipment);
    }
    if (!shipment.providerShipmentId || shipment.status !== ShipmentStatus.CREATED) {
      throw new BadRequestException('Create the Shiprocket shipment before assigning an AWB.');
    }

    try {
      const response = await this.client.assignAwb(shipment.providerShipmentId, dto.courierId);
      const data = this.recordValue(this.recordValue(response.response).data);
      const awbCode = this.stringValue(data.awb_code ?? response.awb_code);
      const success = response.awb_assign_status === 1 || response.awb_assign_status === true;

      if (!success || !awbCode) {
        throw new ShiprocketProviderError('Shiprocket did not assign an AWB.', undefined, response);
      }

      const updated = await this.prisma.shipment.update({
        where: { id: shipment.id },
        data: {
          awbCode,
          courierCompanyId: this.stringValue(data.courier_company_id ?? dto.courierId),
          courierCompanyName: this.stringValue(data.courier_name),
          status: ShipmentStatus.AWB_ASSIGNED,
          statusLabel: 'AWB assigned',
          statusHistory: this.appendHistory(shipment.statusHistory, [
            this.historyEvent(ShipmentStatus.AWB_ASSIGNED, 'AWB assigned'),
          ]),
          rawProviderResponse: this.json(response),
          lastSyncedAt: new Date(),
        },
      });
      await this.syncOrderStatus(orderId, ShipmentStatus.AWB_ASSIGNED);
      return this.serializeAdminShipment(updated);
    } catch (error) {
      throw this.toHttpException(error, 'Unable to assign a Shiprocket AWB.');
    }
  }

  async schedulePickup(orderId: string, dto: SchedulePickupDto) {
    this.assertEnabledAndConfigured();
    const shipment = await this.requireShipment(orderId);

    if (shipment.pickupScheduledAt) {
      return this.serializeAdminShipment(shipment);
    }
    if (!shipment.providerShipmentId || !shipment.awbCode) {
      throw new BadRequestException('Assign an AWB before scheduling pickup.');
    }

    try {
      const response = await this.client.schedulePickup(shipment.providerShipmentId, dto.pickupDate);
      const success = response.pickup_status === 1 || response.pickup_status === true;

      if (!success) {
        throw new ShiprocketProviderError('Shiprocket did not schedule the pickup.', undefined, response);
      }

      const responseData = this.recordValue(response.response);
      const scheduledAt =
        this.dateValue(responseData.pickup_scheduled_date ?? response.pickup_scheduled_date) ??
        (dto.pickupDate ? new Date(`${dto.pickupDate}T00:00:00.000Z`) : new Date());
      const updated = await this.prisma.shipment.update({
        where: { id: shipment.id },
        data: {
          pickupScheduledAt: scheduledAt,
          status: ShipmentStatus.PICKUP_SCHEDULED,
          statusLabel: 'Pickup scheduled',
          statusHistory: this.appendHistory(shipment.statusHistory, [
            this.historyEvent(ShipmentStatus.PICKUP_SCHEDULED, 'Pickup scheduled'),
          ]),
          rawProviderResponse: this.json(response),
          lastSyncedAt: new Date(),
        },
      });
      await this.syncOrderStatus(orderId, ShipmentStatus.PICKUP_SCHEDULED);
      return this.serializeAdminShipment(updated);
    } catch (error) {
      throw this.toHttpException(error, 'Unable to schedule the Shiprocket pickup.');
    }
  }

  async cancelShipment(orderId: string) {
    this.assertEnabledAndConfigured();
    const shipment = await this.requireShipment(orderId);

    if (shipment.status === ShipmentStatus.CANCELLED) {
      return this.serializeAdminShipment(shipment);
    }
    if (!shipment.awbCode || !CANCELLABLE_STATUSES.has(shipment.status)) {
      throw new BadRequestException('This shipment can no longer be cancelled through Shiprocket.');
    }

    try {
      const response = await this.client.cancelShipment(shipment.awbCode);
      const message = this.stringValue(response.message)?.toLowerCase() ?? '';
      const success =
        response.status === 1 || response.status === true || message.includes('cancel');

      if (!success) {
        throw new ShiprocketProviderError('Shiprocket did not confirm cancellation.', undefined, response);
      }

      const updated = await this.prisma.shipment.update({
        where: { id: shipment.id },
        data: {
          status: ShipmentStatus.CANCELLED,
          statusLabel: 'Shipment cancelled',
          cancelledAt: new Date(),
          statusHistory: this.appendHistory(shipment.statusHistory, [
            this.historyEvent(ShipmentStatus.CANCELLED, 'Shipment cancelled'),
          ]),
          rawProviderResponse: this.json(response),
          lastSyncedAt: new Date(),
        },
      });
      return this.serializeAdminShipment(updated);
    } catch (error) {
      throw this.toHttpException(error, 'Unable to cancel the Shiprocket shipment.');
    }
  }

  async refreshTracking(orderId: string) {
    this.assertEnabledAndConfigured();
    const shipment = await this.requireShipment(orderId);

    if (!shipment.awbCode) {
      throw new BadRequestException('Assign an AWB before refreshing tracking.');
    }

    try {
      const response = await this.client.trackAwb(shipment.awbCode);
      const tracking = this.normalizeTracking(response, shipment.awbCode);
      const updated = await this.applyTracking(shipment, tracking);
      return this.serializeAdminShipment(updated);
    } catch (error) {
      throw this.toHttpException(error, 'Unable to refresh Shiprocket tracking.');
    }
  }

  async getCustomerTracking(orderId: string, userId: string, role?: UserRole) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      select: { id: true, userId: true },
    });

    if (!order) throw new NotFoundException('Order not found.');
    if (role !== UserRole.ADMIN && order.userId !== userId) {
      throw new ForbiddenException('You do not have access to this order.');
    }

    const shipment = await this.prisma.shipment.findUnique({ where: { orderId } });
    return shipment ? this.serializeCustomerTracking(shipment) : null;
  }

  verifyWebhookSecret(receivedSecret?: string) {
    const expectedSecret = this.config.get<string>('SHIPROCKET_WEBHOOK_SECRET');

    if (!this.isEnabled() || !expectedSecret) {
      throw new ServiceUnavailableException('Shiprocket webhook is not configured.');
    }
    if (!receivedSecret || !this.secureEqual(receivedSecret, expectedSecret)) {
      throw new ForbiddenException('Invalid Shiprocket webhook credentials.');
    }
  }

  async handleWebhook(payload: unknown) {
    const body = this.recordValue(payload);
    if (Object.keys(body).length === 0) {
      throw new BadRequestException('Invalid Shiprocket webhook payload.');
    }

    const eventKey = this.webhookEventKey(body);
    let eventId: string;

    try {
      const event = await this.prisma.shipmentWebhookEvent.create({
        data: {
          provider: ShipmentProvider.SHIPROCKET,
          eventKey,
          eventType: this.stringValue(body.current_status ?? body.shipment_status) ?? 'tracking',
          payload: this.json(body),
        },
      });
      eventId = event.id;
    } catch (error) {
      if (this.isUniqueConstraintError(error)) return { duplicate: true };
      throw error;
    }

    try {
      const shipment = await this.findShipmentForWebhook(body);
      if (!shipment) {
        await this.prisma.shipmentWebhookEvent.update({
          where: { id: eventId },
          data: {
            status: WebhookEventStatus.IGNORED,
            processedAt: new Date(),
            errorMessage: 'No matching shipment.',
          },
        });
        return { ignored: true };
      }

      const tracking = this.normalizeWebhook(body, shipment.awbCode);
      await this.applyTracking(shipment, tracking);
      await this.prisma.shipmentWebhookEvent.update({
        where: { id: eventId },
        data: {
          shipmentId: shipment.id,
          status: WebhookEventStatus.PROCESSED,
          processedAt: new Date(),
        },
      });
      return { processed: true };
    } catch (error) {
      await this.prisma.shipmentWebhookEvent.update({
        where: { id: eventId },
        data: {
          status: WebhookEventStatus.FAILED,
          processedAt: new Date(),
          errorMessage: this.errorMessage(error).slice(0, 500),
        },
      });
      throw error;
    }
  }

  private async applyTracking(shipment: Shipment, tracking: NormalizedShiprocketTracking) {
    const now = new Date();
    const data: Prisma.ShipmentUpdateInput = {
      status: tracking.status,
      statusLabel: tracking.statusLabel,
      awbCode: tracking.awbCode ?? shipment.awbCode,
      courierCompanyName: tracking.courierCompanyName ?? shipment.courierCompanyName,
      trackingUrl: tracking.trackingUrl ?? shipment.trackingUrl,
      estimatedDeliveryDate: tracking.estimatedDeliveryDate,
      statusHistory: this.appendHistory(shipment.statusHistory, tracking.events),
      rawProviderResponse: this.json(tracking.providerResponse),
      lastSyncedAt: now,
    };

    if (
      new Set<ShipmentStatus>([
        ShipmentStatus.PICKED_UP,
        ShipmentStatus.IN_TRANSIT,
        ShipmentStatus.OUT_FOR_DELIVERY,
      ]).has(tracking.status) &&
      !shipment.shippedAt
    ) {
      data.shippedAt = now;
    }
    if (tracking.status === ShipmentStatus.DELIVERED && !shipment.deliveredAt) {
      data.deliveredAt = now;
    }
    if (tracking.status === ShipmentStatus.CANCELLED && !shipment.cancelledAt) {
      data.cancelledAt = now;
    }

    const updated = await this.prisma.shipment.update({ where: { id: shipment.id }, data });
    await this.syncOrderStatus(shipment.orderId, tracking.status);
    return updated;
  }

  private async syncOrderStatus(orderId: string, shipmentStatus: ShipmentStatus) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      select: { status: true },
    });
    if (!order) return;

    const nextStatus = orderStatusForShipment(shipmentStatus, order.status);
    if (!nextStatus) return;

    const result = await this.prisma.order.updateMany({
      where: { id: orderId, status: order.status },
      data: { status: nextStatus },
    });
    if (result.count !== 1) return;

    void this.notifications
      .handleOrderStatusTransition(orderId, order.status, nextStatus)
      .catch((error: unknown) => {
        this.logger.error(
          `Shipment order notification failed | orderId=${orderId} | status=${nextStatus} | error=${this.errorMessage(error)}`,
        );
      });
  }

  private async getShippableOrder(orderId: string, requireConfirmed = true) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        payment: true,
        items: {
          include: {
            product: { select: { sku: true } },
            variant: { select: { sku: true } },
          },
        },
      },
    });

    if (!order) throw new NotFoundException('Order not found.');
    if (order.payment?.status !== PaymentStatus.PAID || !order.payment.paidAt) {
      throw new BadRequestException('Only paid orders can be shipped.');
    }
    const allowedStatuses = new Set<OrderStatus>(
      requireConfirmed
        ? [OrderStatus.CONFIRMED]
        : [OrderStatus.CONFIRMED, OrderStatus.PROCESSING],
    );
    if (!allowedStatuses.has(order.status)) {
      throw new BadRequestException('Only confirmed orders can create a shipment.');
    }
    if (!order.customerPhone.trim() || !order.shippingAddress.trim() || !order.shippingPincode.trim()) {
      throw new BadRequestException('A complete shipping address and customer phone are required.');
    }
    return order;
  }

  private buildCreatePayload(
    order: Awaited<ReturnType<ShiprocketService['getShippableOrder']>>,
  ): ShiprocketCreateOrderPayload {
    const [firstName, ...lastNameParts] = order.customerName.trim().split(/\s+/);
    const dimensions = this.defaultDimensions();

    return {
      order_id: order.orderNumber.slice(0, 20),
      order_date: order.createdAt.toISOString().replace('T', ' ').slice(0, 19),
      pickup_location: this.pickupLocation(),
      billing_customer_name: firstName || order.customerName,
      billing_last_name: lastNameParts.join(' '),
      billing_address: order.shippingAddress,
      billing_address_2: '',
      billing_city: order.shippingCity,
      billing_pincode: order.shippingPincode,
      billing_state: order.shippingState,
      billing_country: order.shippingCountry,
      billing_email: order.customerEmail,
      billing_phone: order.customerPhone,
      shipping_is_billing: true,
      order_items: order.items.map((item) => ({
        name: item.productName,
        sku: (item.variant?.sku ?? item.product?.sku ?? item.id).slice(0, 50),
        units: item.quantity,
        selling_price: Number((item.unitPriceInPaise / 100).toFixed(2)),
        discount: 0,
        tax: 0,
        hsn: '',
      })),
      payment_method: 'Prepaid',
      shipping_charges: 0,
      giftwrap_charges: 0,
      transaction_charges: 0,
      total_discount: 0,
      sub_total: Number((order.totalInPaise / 100).toFixed(2)),
      length: dimensions.lengthCm,
      breadth: dimensions.breadthCm,
      height: dimensions.heightCm,
      weight: dimensions.weightKg,
    };
  }

  private async findExistingProviderOrder(orderNumber: string) {
    try {
      const response = await this.client.findOrders(orderNumber.slice(0, 20));
      const data = this.recordValue(response.data);
      const orders = Array.isArray(response.data)
        ? response.data
        : Array.isArray(data.data)
          ? data.data
          : [];

      for (const value of orders) {
        const order = this.recordValue(value);
        const sourceId = this.stringValue(order.channel_order_id ?? order.order_id);
        if (sourceId !== orderNumber.slice(0, 20)) continue;
        const shipments = Array.isArray(order.shipments) ? order.shipments : [];
        const shipment = this.recordValue(shipments[0]);
        const shipmentId = this.stringValue(shipment.id ?? shipment.shipment_id);
        const providerOrderId = this.stringValue(order.id);
        if (shipmentId && providerOrderId) {
          return { ...order, order_id: providerOrderId, shipment_id: shipmentId };
        }
      }
      return null;
    } catch (error) {
      this.logger.warn(
        `Shiprocket reconciliation lookup failed | orderNumber=${orderNumber} | error=${this.errorMessage(error)}`,
      );
      return null;
    }
  }

  private normalizeTracking(response: JsonRecord, fallbackAwb: string): NormalizedShiprocketTracking {
    const trackingData = this.recordValue(response.tracking_data ?? response.data ?? response);
    const tracks = Array.isArray(trackingData.shipment_track)
      ? trackingData.shipment_track.map((value) => this.recordValue(value))
      : [];
    const current = tracks[0] ?? trackingData;
    const label =
      this.stringValue(current.current_status ?? current.shipment_status ?? trackingData.shipment_status) ??
      'Shipment created';
    const code = this.numberValue(
      current.shipment_status_id ?? current.current_status_id ?? trackingData.shipment_status,
    );
    const activities = Array.isArray(trackingData.shipment_track_activities)
      ? trackingData.shipment_track_activities
      : [];
    const events = activities.map((value) => this.trackingEvent(this.recordValue(value)));

    return {
      status: mapShiprocketStatus(code, label),
      statusLabel: label,
      awbCode: this.stringValue(current.awb_code ?? current.awb) ?? fallbackAwb,
      courierCompanyName: this.stringValue(current.courier_name ?? current.courier_company_name),
      trackingUrl: this.stringValue(trackingData.track_url ?? current.track_url),
      estimatedDeliveryDate: this.dateValue(current.edd ?? current.etd ?? trackingData.etd),
      events: events.length > 0 ? events : [this.historyEvent(mapShiprocketStatus(code, label), label)],
      providerResponse: response,
    };
  }

  private normalizeWebhook(body: JsonRecord, fallbackAwb: string | null): NormalizedShiprocketTracking {
    const label =
      this.stringValue(body.shipment_status ?? body.current_status) ?? 'Shipment update';
    const code = this.numberValue(body.shipment_status_id ?? body.current_status_id);
    const scans = Array.isArray(body.scans) ? body.scans : [];
    const events = scans.map((value) => this.trackingEvent(this.recordValue(value)));

    return {
      status: mapShiprocketStatus(code, label),
      statusLabel: label,
      awbCode: this.stringValue(body.awb) ?? fallbackAwb,
      courierCompanyName: this.stringValue(body.courier_name),
      trackingUrl: this.stringValue(body.track_url),
      estimatedDeliveryDate: this.dateValue(body.etd),
      events: events.length > 0 ? events : [this.historyEvent(mapShiprocketStatus(code, label), label)],
      providerResponse: body,
    };
  }

  private trackingEvent(value: JsonRecord): ShiprocketTrackingEvent {
    const label =
      this.stringValue(value['sr-status-label'] ?? value.activity ?? value.status) ?? 'Shipment update';
    const code = this.numberValue(value['sr-status'] ?? value.status_code);
    return {
      status: mapShiprocketStatus(code, label),
      statusLabel: label,
      occurredAt: this.dateValue(value.date ?? value.current_timestamp)?.toISOString() ?? null,
      activity: this.stringValue(value.activity),
      location: this.stringValue(value.location),
    };
  }

  private async findShipmentForWebhook(body: JsonRecord) {
    const awbCode = this.stringValue(body.awb ?? body.awb_code);
    const providerShipmentId = this.stringValue(body.shipment_id);
    const providerOrderId = this.stringValue(body.sr_order_id);
    const sourceOrderId = this.stringValue(body.order_id);

    if (!awbCode && !providerShipmentId && !providerOrderId && !sourceOrderId) {
      return null;
    }

    return this.prisma.shipment.findFirst({
      where: {
        OR: [
          ...(awbCode ? [{ awbCode }] : []),
          ...(providerShipmentId ? [{ providerShipmentId }] : []),
          ...(providerOrderId ? [{ providerOrderId }] : []),
          ...(sourceOrderId ? [{ order: { orderNumber: sourceOrderId } }] : []),
        ],
      },
    });
  }

  private webhookEventKey(body: JsonRecord) {
    const components = [
      body.awb,
      body.shipment_id,
      body.sr_order_id,
      body.shipment_status_id,
      body.current_status_id,
      body.current_timestamp,
    ];
    return createHash('sha256').update(JSON.stringify(components)).digest('hex');
  }

  private async resolvePickupPostcode() {
    const response = await this.client.getPickupLocations();
    const data = this.recordValue(response.data);
    const locations = Array.isArray(response.shipping_address)
      ? response.shipping_address
      : Array.isArray(data.shipping_address)
        ? data.shipping_address
        : [];
    const expected = this.pickupLocation().toLowerCase();
    const location = locations
      .map((value) => this.recordValue(value))
      .find((value) => this.stringValue(value.pickup_location)?.toLowerCase() === expected);
    const postcode = location ? this.stringValue(location.pin_code ?? location.pincode) : null;

    if (!postcode) {
      throw new BadRequestException(
        'Configured Shiprocket pickup location was not found or has no pincode.',
      );
    }
    return postcode;
  }

  private extractCourierRates(response: JsonRecord): ShiprocketCourierRate[] {
    const data = this.recordValue(response.data);
    const values = Array.isArray(data.available_courier_companies)
      ? data.available_courier_companies
      : [];

    return values.flatMap((value) => {
      const courier = this.recordValue(value);
      const courierCompanyId = this.numberValue(courier.courier_company_id);
      const courierName = this.stringValue(courier.courier_name);
      if (!courierCompanyId || !courierName) return [];
      const rate = this.numberValue(courier.rate);
      return [{
        courierCompanyId,
        courierName,
        rateInPaise: rate === null ? null : Math.round(rate * 100),
        estimatedDeliveryDays: this.numberValue(courier.estimated_delivery_days),
        etd: this.stringValue(courier.etd),
        mode: this.stringValue(courier.mode),
      }];
    });
  }

  private extractShipmentId(response: JsonRecord) {
    const direct = this.stringValue(response.shipment_id);
    if (direct) return direct;
    const shipment = this.recordValue(response.shipment);
    if (shipment.id) return this.stringValue(shipment.id);
    const shipments = Array.isArray(response.shipments) ? response.shipments : [];
    return this.stringValue(this.recordValue(shipments[0]).id);
  }

  private serializeAdminShipment(shipment: Shipment) {
    return {
      id: shipment.id,
      provider: shipment.provider,
      providerOrderId: shipment.providerOrderId,
      providerShipmentId: shipment.providerShipmentId,
      awbCode: shipment.awbCode,
      courierCompanyId: shipment.courierCompanyId,
      courierCompanyName: shipment.courierCompanyName,
      pickupLocation: shipment.pickupLocation,
      trackingUrl: shipment.trackingUrl,
      status: shipment.status,
      statusLabel: shipment.statusLabel,
      statusHistory: shipment.statusHistory,
      weightKg: shipment.weightKg,
      lengthCm: shipment.lengthCm,
      breadthCm: shipment.breadthCm,
      heightCm: shipment.heightCm,
      shippingChargeInPaise: shipment.shippingChargeInPaise,
      estimatedDeliveryDate: shipment.estimatedDeliveryDate,
      pickupScheduledAt: shipment.pickupScheduledAt,
      shippedAt: shipment.shippedAt,
      deliveredAt: shipment.deliveredAt,
      cancelledAt: shipment.cancelledAt,
      lastSyncedAt: shipment.lastSyncedAt,
      createdAt: shipment.createdAt,
      updatedAt: shipment.updatedAt,
    };
  }

  private serializeCustomerTracking(shipment: Shipment) {
    return {
      status: shipment.status,
      statusLabel: shipment.statusLabel,
      awbCode: shipment.awbCode,
      courierCompanyName: shipment.courierCompanyName,
      trackingUrl: shipment.trackingUrl,
      estimatedDeliveryDate: shipment.estimatedDeliveryDate,
      timeline: shipment.statusHistory,
    };
  }

  private async requireShipment(orderId: string) {
    await this.ensureOrderExists(orderId);
    const shipment = await this.prisma.shipment.findUnique({ where: { orderId } });
    if (!shipment) throw new NotFoundException('No shipment exists for this order.');
    return shipment;
  }

  private async ensureOrderExists(orderId: string) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId }, select: { id: true } });
    if (!order) throw new NotFoundException('Order not found.');
  }

  private isEnabled() {
    return this.config.get<boolean>('SHIPROCKET_ENABLED', false);
  }

  private assertEnabledAndConfigured() {
    if (!this.isEnabled()) {
      throw new ServiceUnavailableException('Shiprocket shipping is disabled.');
    }
    const missing = ['SHIPROCKET_EMAIL', 'SHIPROCKET_PASSWORD', 'SHIPROCKET_PICKUP_LOCATION'].filter(
      (key) => !this.config.get<string>(key)?.trim(),
    );
    if (missing.length > 0) {
      throw new ServiceUnavailableException('Shiprocket shipping is not fully configured.');
    }
  }

  private pickupLocation() {
    const value = this.config.get<string>('SHIPROCKET_PICKUP_LOCATION')?.trim();
    if (!value) throw new ServiceUnavailableException('Shiprocket pickup location is not configured.');
    return value;
  }

  private defaultDimensions() {
    return {
      weightKg: this.config.get<number>('SHIPROCKET_DEFAULT_WEIGHT_KG', 0.5),
      lengthCm: this.config.get<number>('SHIPROCKET_DEFAULT_LENGTH_CM', 30),
      breadthCm: this.config.get<number>('SHIPROCKET_DEFAULT_BREADTH_CM', 25),
      heightCm: this.config.get<number>('SHIPROCKET_DEFAULT_HEIGHT_CM', 5),
    };
  }

  private appendHistory(current: Prisma.JsonValue, next: ShiprocketTrackingEvent[]) {
    const existing = Array.isArray(current)
      ? current.filter((value): value is Prisma.JsonObject => Boolean(value) && typeof value === 'object' && !Array.isArray(value))
      : [];
    const keys = new Set(existing.map((value) => `${value.statusLabel}|${value.occurredAt}|${value.activity}`));
    const merged = [...existing];

    next.forEach((event) => {
      const key = `${event.statusLabel}|${event.occurredAt}|${event.activity}`;
      if (!keys.has(key)) {
        merged.push(this.json(event) as Prisma.JsonObject);
        keys.add(key);
      }
    });
    return this.json(merged);
  }

  private historyEvent(status: ShipmentStatus, statusLabel: string): ShiprocketTrackingEvent {
    return {
      status,
      statusLabel,
      occurredAt: new Date().toISOString(),
      activity: null,
      location: null,
    };
  }

  private async recordFailure(shipmentId: string, label: string, error: unknown) {
    await this.prisma.shipment.update({
      where: { id: shipmentId },
      data: {
        status: ShipmentStatus.FAILED,
        statusLabel: label,
        rawProviderResponse: this.json(this.safeError(error)),
        lastSyncedAt: new Date(),
      },
    });
  }

  private safeError(error: unknown): JsonRecord {
    if (error instanceof ShiprocketProviderError) {
      return {
        message: error.message,
        statusCode: error.statusCode ?? null,
        details: error.safeDetails ?? null,
      };
    }
    return { message: 'Unexpected shipment provider error.' };
  }

  private toHttpException(error: unknown, fallback: string) {
    if (
      error instanceof BadRequestException ||
      error instanceof ConflictException ||
      error instanceof ServiceUnavailableException
    ) {
      return error;
    }
    if (error instanceof ShiprocketProviderError) {
      return new BadGatewayException(`${fallback} ${error.message}`);
    }
    this.logger.error(`${fallback} error=${this.errorMessage(error)}`);
    return new BadGatewayException(fallback);
  }

  private secureEqual(received: string, expected: string) {
    const receivedBuffer = Buffer.from(received);
    const expectedBuffer = Buffer.from(expected);
    return receivedBuffer.length === expectedBuffer.length && timingSafeEqual(receivedBuffer, expectedBuffer);
  }

  private json(value: unknown): Prisma.InputJsonValue {
    return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
  }

  private recordValue(value: unknown): JsonRecord {
    return value && typeof value === 'object' && !Array.isArray(value) ? (value as JsonRecord) : {};
  }

  private stringValue(value: unknown) {
    if (typeof value === 'string' && value.trim()) return value.trim();
    if (typeof value === 'number' && Number.isFinite(value)) return String(value);
    return null;
  }

  private numberValue(value: unknown) {
    const number = typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : NaN;
    return Number.isFinite(number) ? number : null;
  }

  private dateValue(value: unknown) {
    if (typeof value !== 'string' || !value.trim()) return null;
    const shiprocketDate = value.trim().match(
      /^(\d{2})\s+(\d{2})\s+(\d{4})(?:\s+(\d{2}):(\d{2}):(\d{2}))?$/,
    );
    const date = shiprocketDate
      ? new Date(
          Date.UTC(
            Number(shiprocketDate[3]),
            Number(shiprocketDate[2]) - 1,
            Number(shiprocketDate[1]),
            Number(shiprocketDate[4] ?? 0),
            Number(shiprocketDate[5] ?? 0),
            Number(shiprocketDate[6] ?? 0),
          ),
        )
      : new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  private isUniqueConstraintError(error: unknown) {
    return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002';
  }

  private errorMessage(error: unknown) {
    return error instanceof Error ? error.message : String(error);
  }
}
