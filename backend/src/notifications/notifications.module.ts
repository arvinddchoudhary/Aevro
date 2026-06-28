import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../prisma/prisma.module';
import { BrevoWebhookController } from './brevo-webhook.controller';
import { BrevoService } from './brevo.service';
import { NotificationsService } from './notifications.service';

@Module({
  imports: [ConfigModule, PrismaModule],
  controllers: [BrevoWebhookController],
  providers: [BrevoService, NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
