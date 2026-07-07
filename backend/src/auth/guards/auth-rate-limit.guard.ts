import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import type { FastifyRequest } from 'fastify';

type RateLimitRule = {
  limit: number;
  windowMs: number;
};

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const FIFTEEN_MINUTES = 15 * 60 * 1000;

const AUTH_RATE_LIMITS: Record<string, RateLimitRule> = {
  'POST /api/v1/auth/register': { limit: 5, windowMs: FIFTEEN_MINUTES },
  'POST /api/v1/auth/verify-email-otp': { limit: 10, windowMs: FIFTEEN_MINUTES },
  'POST /api/v1/auth/resend-email-otp': { limit: 5, windowMs: FIFTEEN_MINUTES },
  'POST /api/v1/auth/login': { limit: 10, windowMs: FIFTEEN_MINUTES },
  'POST /api/v1/auth/login/send-otp': { limit: 5, windowMs: FIFTEEN_MINUTES },
  'POST /api/v1/auth/login/verify-otp': { limit: 10, windowMs: FIFTEEN_MINUTES },
  'POST /api/v1/auth/google': { limit: 20, windowMs: FIFTEEN_MINUTES },
  'POST /api/v1/auth/refresh': { limit: 60, windowMs: FIFTEEN_MINUTES },
};

@Injectable()
export class AuthRateLimitGuard implements CanActivate {
  private readonly buckets = new Map<string, RateLimitEntry>();

  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<FastifyRequest>();
    const key = this.getRouteKey(request);
    const rule = AUTH_RATE_LIMITS[key];

    if (!rule) {
      return true;
    }

    this.assertWithinLimit(`ip:${this.getIpAddress(request)}:${key}`, rule);

    const email = this.getEmailFromBody(request.body);

    if (email) {
      this.assertWithinLimit(`email:${email}:${key}`, rule);
    }

    return true;
  }

  private assertWithinLimit(key: string, rule: RateLimitRule) {
    const now = Date.now();
    const current = this.buckets.get(key);

    if (!current || current.resetAt <= now) {
      this.buckets.set(key, {
        count: 1,
        resetAt: now + rule.windowMs,
      });
      return;
    }

    if (current.count >= rule.limit) {
      throw new HttpException(
        'Too many requests. Please wait and try again.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    current.count += 1;
  }

  private getRouteKey(request: FastifyRequest) {
    const path = request.url.split('?')[0];

    return `${request.method.toUpperCase()} ${path}`;
  }

  private getIpAddress(request: FastifyRequest) {
    const forwardedFor = request.headers['x-forwarded-for'];

    if (typeof forwardedFor === 'string' && forwardedFor.trim()) {
      return forwardedFor.split(',')[0]?.trim() ?? request.ip;
    }

    return request.ip;
  }

  private getEmailFromBody(body: unknown) {
    if (!body || typeof body !== 'object' || !('email' in body)) {
      return null;
    }

    const email = (body as { email?: unknown }).email;

    return typeof email === 'string' ? email.trim().toLowerCase() : null;
  }
}
