import { Body, Controller, Headers, HttpCode, Inject, Post } from '@nestjs/common';
import { ShiprocketService } from './shiprocket.service';

@Controller('webhooks/shiprocket')
export class ShiprocketWebhookController {
  constructor(@Inject(ShiprocketService) private readonly shiprocket: ShiprocketService) {}

  @Post()
  @HttpCode(200)
  async handle(
    @Headers('x-api-key') webhookSecret: string | undefined,
    @Body() payload: unknown,
  ) {
    this.shiprocket.verifyWebhookSecret(webhookSecret);
    return { success: true, data: await this.shiprocket.handleWebhook(payload) };
  }
}
