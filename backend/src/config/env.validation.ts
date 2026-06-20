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
