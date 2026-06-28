import { plainToInstance, Transform } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  Min,
  validateSync,
} from 'class-validator';

enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

class EnvironmentVariables {
  @IsEnum(Environment)
  @IsOptional()
  NODE_ENV: Environment = Environment.Development;

  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  @Max(65535)
  @IsOptional()
  PORT = 8000;

  @IsUrl({ require_tld: false })
  @IsOptional()
  FRONTEND_URL = 'http://localhost:3000';

  @IsString()
  @IsOptional()
  CORS_ORIGINS?: string;

  @IsString()
  DATABASE_URL!: string;

  @IsString()
  @IsOptional()
  RAZORPAY_KEY_ID!: string;

  @IsString()
  @IsOptional()
  RAZORPAY_KEY_SECRET!: string;

  @IsString()
  @IsOptional()
  RAZORPAY_WEBHOOK_SECRET?: string;

  @IsString()
  @IsOptional()
  JWT_ACCESS_SECRET?: string;

  @IsString()
  @IsOptional()
  JWT_REFRESH_SECRET?: string;

  @IsString()
  @IsOptional()
  JWT_ACCESS_EXPIRES_IN = '15m';

  @IsString()
  @IsOptional()
  JWT_REFRESH_EXPIRES_IN = '30d';

  @IsString()
  @IsOptional()
  GOOGLE_CLIENT_ID?: string;

  @IsString()
  @IsOptional()
  COOKIE_DOMAIN?: string;

  @IsString()
  @IsOptional()
  CLOUDINARY_CLOUD_NAME?: string;

  @IsString()
  @IsOptional()
  CLOUDINARY_API_KEY?: string;

  @IsString()
  @IsOptional()
  CLOUDINARY_API_SECRET?: string;

  @IsString()
  @IsOptional()
  BREVO_API_KEY?: string;

  @IsString()
  @IsOptional()
  BREVO_SENDER_EMAIL?: string;

  @IsString()
  @IsOptional()
  BREVO_SENDER_NAME?: string;

  @IsString()
  @IsOptional()
  BREVO_REPLY_TO_EMAIL?: string;

  @IsString()
  @IsOptional()
  BREVO_REPLY_TO_NAME?: string;

  @IsString()
  @IsOptional()
  BREVO_TEMPLATE_ORDER_CONFIRMED_CUSTOMER?: string;

  @IsString()
  @IsOptional()
  BREVO_TEMPLATE_ORDER_CONFIRMED_ADMIN?: string;

  @IsString()
  @IsOptional()
  BREVO_TEMPLATE_ORDER_SHIPPED?: string;

  @IsString()
  @IsOptional()
  BREVO_TEMPLATE_ORDER_DELIVERED?: string;

  @IsString()
  @IsOptional()
  BREVO_TEMPLATE_PAYMENT_FAILED?: string;

  @IsString()
  @IsOptional()
  BREVO_TEMPLATE_EMAIL_VERIFICATION_OTP?: string;

  @IsString()
  @IsOptional()
  AEVRO_ADMIN_EMAIL?: string;

  @IsString()
  @IsOptional()
  ADMIN_ORDER_NOTIFICATION_EMAIL?: string;

  @IsString()
  @IsOptional()
  AEVRO_SUPPORT_EMAIL?: string;
}

export function validateEnvironment(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }

  return validatedConfig;
}
