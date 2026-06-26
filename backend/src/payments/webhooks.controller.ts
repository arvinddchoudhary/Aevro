import { BadRequestException, Controller, Inject, Post, Req } from '@nestjs/common';
import type { FastifyRequest } from 'fastify';
import { PaymentsService } from './payments.service';

type RawBodyRequest = FastifyRequest & {
  rawBody?: string;
};

@Controller('webhooks')
export class WebhooksController {
  constructor(
    @Inject(PaymentsService)
    private readonly paymentsService: PaymentsService,
  ) {}

  @Post('razorpay')
  async handleRazorpayWebhook(@Req() request: RawBodyRequest) {
    const signature = request.headers['x-razorpay-signature'];
    const eventId = request.headers['x-razorpay-event-id'];

    if (!request.rawBody || typeof signature !== 'string') {
      throw new BadRequestException('Invalid Razorpay webhook request.');
    }

    const result = await this.paymentsService.processRazorpayWebhook({
      rawBody: request.rawBody,
      signature,
      eventId: typeof eventId === 'string' ? eventId : undefined,
    });

    return {
      success: true,
      data: result,
    };
  }
}
