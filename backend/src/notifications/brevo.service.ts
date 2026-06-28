import {
  Inject,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EmailEventType } from '@prisma/client';

type TemplateEmailInput = {
  recipientEmail: string;
  recipientName?: string | null;
  subject: string;
  templateId: number;
  params: Record<string, unknown>;
};

type BrevoEmailResponse = {
  messageId?: string;
};

@Injectable()
export class BrevoService {
  private readonly logger = new Logger(BrevoService.name);
  private readonly apiKey: string;
  private readonly senderEmail: string;
  private readonly senderName: string;
  private readonly replyToEmail: string;
  private readonly replyToName: string;
  private readonly templateIds: Partial<Record<EmailEventType, number>>;

  constructor(@Inject(ConfigService) private readonly configService: ConfigService) {
    this.apiKey = this.configService.get<string>('BREVO_API_KEY') ?? '';
    this.senderEmail =
      this.configService.get<string>('BREVO_SENDER_EMAIL') ?? '';
    this.senderName =
      this.configService.get<string>('BREVO_SENDER_NAME') ?? 'AEVRO';
    this.replyToEmail =
      this.configService.get<string>('BREVO_REPLY_TO_EMAIL') ??
      this.configService.get<string>('AEVRO_SUPPORT_EMAIL') ??
      this.senderEmail;
    this.replyToName =
      this.configService.get<string>('BREVO_REPLY_TO_NAME') ?? 'AEVRO Support';
    this.templateIds = {
      [EmailEventType.ORDER_CONFIRMED_CUSTOMER]: this.getTemplateId(
        'BREVO_TEMPLATE_ORDER_CONFIRMED_CUSTOMER',
      ),
      [EmailEventType.ORDER_CONFIRMED_ADMIN]: this.getTemplateId(
        'BREVO_TEMPLATE_ORDER_CONFIRMED_ADMIN',
      ),
      [EmailEventType.ORDER_SHIPPED]: this.getTemplateId(
        'BREVO_TEMPLATE_ORDER_SHIPPED',
      ),
      [EmailEventType.ORDER_DELIVERED]: this.getTemplateId(
        'BREVO_TEMPLATE_ORDER_DELIVERED',
      ),
      [EmailEventType.PAYMENT_FAILED]: this.getTemplateId(
        'BREVO_TEMPLATE_PAYMENT_FAILED',
      ),
      [EmailEventType.EMAIL_VERIFICATION_OTP]: this.getTemplateId(
        'BREVO_TEMPLATE_EMAIL_VERIFICATION_OTP',
      ),
    };
  }

  getTemplateIdForEvent(eventType: EmailEventType) {
    return this.templateIds[eventType];
  }

  async sendTemplateEmail(input: TemplateEmailInput) {
    this.assertConfigured();

    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'api-key': this.apiKey,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        sender: {
          email: this.senderEmail,
          name: this.senderName,
        },
        to: [
          {
            email: input.recipientEmail,
            name: input.recipientName ?? undefined,
          },
        ],
        replyTo: {
          email: this.replyToEmail,
          name: this.replyToName,
        },
        subject: input.subject,
        templateId: input.templateId,
        params: input.params,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      this.logger.error(
        `Brevo send rejected | status=${response.status} | to=${input.recipientEmail} | templateId=${input.templateId} | error=${errorText || response.statusText}`,
      );
      throw new ServiceUnavailableException(
        `Brevo rejected the email request: ${errorText || response.statusText}`,
      );
    }

    const body = (await response.json()) as BrevoEmailResponse;

    return {
      messageId: body.messageId,
    };
  }

  private assertConfigured() {
    if (!this.apiKey || !this.senderEmail) {
      throw new ServiceUnavailableException(
        'Brevo email credentials are not configured.',
      );
    }
  }

  private getTemplateId(envKey: string) {
    const value = this.configService.get<string>(envKey);
    if (!value) {
      return undefined;
    }

    const templateId = Number(value);
    return Number.isInteger(templateId) && templateId > 0
      ? templateId
      : undefined;
  }
}
