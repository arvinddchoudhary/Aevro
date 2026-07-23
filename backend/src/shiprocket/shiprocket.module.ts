import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { PrismaModule } from '../prisma/prisma.module';
import { ShiprocketAdminController } from './shiprocket-admin.controller';
import { CheckoutDeliveryEstimateController } from './checkout-delivery-estimate.controller';
import { ShiprocketWebhookController } from './shiprocket-webhook.controller';
import { ShiprocketClient } from './shiprocket.client';
import { ShiprocketController } from './shiprocket.controller';
import { ShiprocketService } from './shiprocket.service';

@Module({
  imports: [AuthModule, NotificationsModule, PrismaModule],
  controllers: [
    ShiprocketAdminController,
    CheckoutDeliveryEstimateController,
    ShiprocketController,
    ShiprocketWebhookController,
  ],
  providers: [ShiprocketClient, ShiprocketService],
  exports: [ShiprocketService],
})
export class ShiprocketModule {}
