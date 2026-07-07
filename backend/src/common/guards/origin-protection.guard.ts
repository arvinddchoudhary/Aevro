import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Inject,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { FastifyRequest } from 'fastify';
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
} from '../../auth/auth.constants';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);
const WEBHOOK_PATHS = ['/api/v1/webhooks/razorpay', '/api/v1/webhooks/brevo'];

@Injectable()
export class OriginProtectionGuard implements CanActivate {
  private readonly allowedOrigins: Set<string>;

  constructor(@Inject(ConfigService) configService: ConfigService) {
    const frontendUrl = configService.get<string>('FRONTEND_URL');
    const corsOrigins = configService
      .get<string>('CORS_ORIGINS')
      ?.split(',')
      .map((origin) => origin.trim())
      .filter(Boolean);

    this.allowedOrigins = new Set(
      [frontendUrl, ...(corsOrigins ?? [])]
        .filter((origin): origin is string => Boolean(origin))
        .map((origin) => this.normalizeOrigin(origin)),
    );
  }

  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<FastifyRequest>();

    if (SAFE_METHODS.has(request.method.toUpperCase())) {
      return true;
    }

    if (this.isWebhookPath(request.url)) {
      return true;
    }

    const origin = this.getSingleHeader(request, 'origin');
    const referer = this.getSingleHeader(request, 'referer');

    if (origin) {
      this.assertAllowedOrigin(origin);
      return true;
    }

    if (referer) {
      this.assertAllowedOrigin(referer);
      return true;
    }

    if (this.hasAuthCookie(request)) {
      throw new ForbiddenException('Invalid request origin.');
    }

    return true;
  }

  private isWebhookPath(url: string) {
    return WEBHOOK_PATHS.some((path) => url.startsWith(path));
  }

  private hasAuthCookie(request: FastifyRequest) {
    return Boolean(
      request.cookies?.[ACCESS_TOKEN_COOKIE] ||
        request.cookies?.[REFRESH_TOKEN_COOKIE],
    );
  }

  private assertAllowedOrigin(value: string) {
    const origin = this.normalizeOrigin(value);

    if (!origin || !this.allowedOrigins.has(origin)) {
      throw new ForbiddenException('Invalid request origin.');
    }
  }

  private getSingleHeader(request: FastifyRequest, name: string) {
    const value = request.headers[name];

    return Array.isArray(value) ? value[0] : value;
  }

  private normalizeOrigin(value: string) {
    try {
      return new URL(value).origin;
    } catch {
      return '';
    }
  }
}
