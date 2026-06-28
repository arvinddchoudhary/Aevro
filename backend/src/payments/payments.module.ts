import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { NotificationsModule } from '../notifications/notifications.module';
import { PrismaModule } from '../prisma/prisma.module';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { WebhooksController } from './webhooks.controller';

@Module({
  imports: [ConfigModule, PrismaModule, NotificationsModule],
  controllers: [PaymentsController, WebhooksController],
  providers: [PaymentsService],
})
export class PaymentsModule {}
