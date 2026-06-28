import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';

@Controller({
  path: 'webhooks/brevo',
  version: '1',
})
export class BrevoWebhookController {
  constructor(
    @Inject(NotificationsService)
    private readonly notificationsService: NotificationsService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  processBrevoWebhook(@Body() payload: Record<string, unknown>) {
    return this.notificationsService.processBrevoWebhook(payload);
  }
}
