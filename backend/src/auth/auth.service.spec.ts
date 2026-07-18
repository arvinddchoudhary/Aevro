import assert from 'node:assert/strict';
import test from 'node:test';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException, ServiceUnavailableException } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { AuthService } from './auth.service';
import { GoogleLoginDto, GOOGLE_ID_TOKEN_MAX_LENGTH } from './dto/google-login.dto';

const user = {
  id: 'user-1',
  name: 'Google User',
  email: 'google@aevro.com',
  phone: null,
  passwordHash: null,
  role: UserRole.CUSTOMER,
  emailVerified: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

function createAuthService(options: { googleClientId?: string; verify?: () => Promise<unknown> } = {}) {
  const refreshSessions: Array<{ refreshTokenHash: string; userId: string }> = [];
  const prisma = {
    refreshSession: {
      create: async ({ data }: { data: { refreshTokenHash: string; userId: string } }) => {
        refreshSessions.push(data);
        return data;
      },
    },
  };
  const usersService = {
    upsertGoogleUser: async () => user,
    serializeUser: (value: typeof user) => ({ id: value.id, email: value.email, role: value.role }),
  };
  const service = new AuthService(
    prisma as never,
    usersService as never,
    {} as never,
    new ConfigService({
      JWT_ACCESS_SECRET: 'access-secret',
      JWT_REFRESH_SECRET: 'refresh-secret',
      JWT_ACCESS_EXPIRES_IN: '15m',
      JWT_REFRESH_EXPIRES_IN: '30d',
      GOOGLE_CLIENT_ID: options.googleClientId ?? 'google-client-id',
    }),
  );

  (service as unknown as { googleClient: { verifyIdToken: () => Promise<unknown> } }).googleClient = {
    verifyIdToken:
      options.verify ??
      (async () => ({
        getPayload: () => ({
          sub: 'google-sub',
          email: user.email,
          email_verified: true,
          name: user.name,
        }),
      })),
  };

  return { service, refreshSessions };
}

test('creates the normal AEVRO access and refresh session for a valid Google credential', async () => {
  const { service, refreshSessions } = createAuthService();
  const result = await service.googleLogin({ idToken: 'google-id-token' }, {});

  assert.equal(result.user.id, user.id);
  assert.ok(result.accessToken);
  assert.ok(result.refreshToken);
  assert.equal(refreshSessions.length, 1);
  assert.equal(refreshSessions[0].userId, user.id);
  assert.notEqual(refreshSessions[0].refreshTokenHash, result.refreshToken);
  assert.equal(refreshSessions[0].refreshTokenHash.includes('google-id-token'), false);
});

test('returns 401 for invalid, expired, and wrong-audience Google verification failures', async () => {
  for (const reason of ['invalid', 'expired', 'wrong audience']) {
    const { service } = createAuthService({
      verify: async () => {
        throw new Error(reason);
      },
    });

    await assert.rejects(
      () => service.googleLogin({ idToken: 'invalid-token' }, {}),
      (error: unknown) =>
        error instanceof UnauthorizedException &&
        error.message === 'Invalid or expired Google credential.',
    );
  }
});

test('returns 401 when Google reports an unverified email', async () => {
  const { service } = createAuthService({
    verify: async () => ({
      getPayload: () => ({ sub: 'google-sub', email: user.email, email_verified: false }),
    }),
  });

  await assert.rejects(
    () => service.googleLogin({ idToken: 'unverified-email-token' }, {}),
    (error: unknown) => error instanceof UnauthorizedException && error.message === 'Google email must be verified.',
  );
});

test('keeps a missing GOOGLE_CLIENT_ID as a safe service configuration failure', async () => {
  const { service } = createAuthService({ googleClientId: '' });

  await assert.rejects(
    () => service.googleLogin({ idToken: 'any-token' }, {}),
    (error: unknown) => error instanceof ServiceUnavailableException,
  );
});

test('rejects empty and oversized Google credential payloads before verification', async () => {
  const empty = plainToInstance(GoogleLoginDto, { idToken: '   ' });
  const oversized = plainToInstance(GoogleLoginDto, {
    idToken: 'a'.repeat(GOOGLE_ID_TOKEN_MAX_LENGTH + 1),
  });

  assert.ok((await validate(empty)).length > 0);
  assert.ok((await validate(oversized)).length > 0);
});
