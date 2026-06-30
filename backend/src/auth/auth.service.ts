import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthProvider, User, UserRole } from '@prisma/client';
import { OAuth2Client } from 'google-auth-library';
import {
  createHmac,
  randomBytes,
  randomInt,
  scrypt as scryptCallback,
  timingSafeEqual,
} from 'crypto';
import { NotificationsService } from '../notifications/notifications.service';
import { promisify } from 'util';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { GoogleLoginDto } from './dto/google-login.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

const scrypt = promisify(scryptCallback);
const OTP_EXPIRES_IN_MINUTES = 10;
const OTP_MAX_ATTEMPTS = 5;
const OTP_RESEND_COOLDOWN_MS = 60 * 1000;
const OTP_MAX_RESENDS = 5;

type SessionContext = {
  userAgent?: string;
  ipAddress?: string;
};

type JwtPayload = {
  sub: string;
  email: string;
  role: UserRole;
  type: 'access';
};

@Injectable()
export class AuthService {
  private readonly googleClient = new OAuth2Client();
  private readonly accessSecret: string;
  private readonly refreshSecret: string;
  private readonly accessExpiresIn: string;
  private readonly refreshExpiresIn: string;
  private readonly googleClientId: string;

  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(UsersService) private readonly usersService: UsersService,
    @Inject(NotificationsService)
    private readonly notificationsService: NotificationsService,
    @Inject(ConfigService) configService: ConfigService,
  ) {
    this.accessSecret = configService.get<string>('JWT_ACCESS_SECRET') ?? '';
    this.refreshSecret = configService.get<string>('JWT_REFRESH_SECRET') ?? '';
    this.accessExpiresIn =
      configService.get<string>('JWT_ACCESS_EXPIRES_IN') ?? '15m';
    this.refreshExpiresIn =
      configService.get<string>('JWT_REFRESH_EXPIRES_IN') ?? '30d';
    this.googleClientId = configService.get<string>('GOOGLE_CLIENT_ID') ?? '';
  }

  async register(dto: RegisterDto, _context: SessionContext) {
    this.assertJwtConfigured();

    await this.cleanupExpiredPendingRegistrations();
    const email = dto.email.trim().toLowerCase();
    const existingUser = await this.usersService.findByEmail(email);

    if (existingUser) {
      throw new ConflictException('A user with this email already exists.');
    }

    const passwordHash = await this.hashPassword(dto.password);
    const otp = this.createEmailOtp();
    const pending = await this.prisma.pendingRegistration.upsert({
      where: {
        email,
      },
      create: {
        name: dto.name.trim(),
        email,
        passwordHash,
        otpHash: this.hashEmailOtp(otp),
        otpExpiresAt: this.createOtpExpiry(),
        otpAttemptCount: 0,
        resendCount: 0,
        lastSentAt: new Date(),
      },
      update: {
        name: dto.name.trim(),
        passwordHash,
        otpHash: this.hashEmailOtp(otp),
        otpExpiresAt: this.createOtpExpiry(),
        otpAttemptCount: 0,
        resendCount: 0,
        lastSentAt: new Date(),
      },
    });

    await this.notificationsService.sendEmailVerificationOtp({
      user: {
        name: pending.name,
        email: pending.email,
      },
      code: otp,
      expiresInMinutes: OTP_EXPIRES_IN_MINUTES,
    });

    return {
      email: pending.email,
      emailVerification: {
        sent: true,
        expiresInMinutes: OTP_EXPIRES_IN_MINUTES,
        error: null,
      },
    };
  }

  async login(dto: LoginDto, context: SessionContext) {
    this.assertJwtConfigured();

    const user = await this.usersService.findByEmail(dto.email.trim());

    if (!user?.passwordHash) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    const isValidPassword = await this.verifyPassword(
      dto.password,
      user.passwordHash,
    );

    if (!isValidPassword) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    return this.createAuthResult(user, context);
  }

  async sendLoginOtp(emailInput: string) {
    this.assertJwtConfigured();

    await this.cleanupExpiredLoginOtps();
    const email = emailInput.trim().toLowerCase();
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      throw new BadRequestException(
        'No account found with this email. Please create an account.',
      );
    }

    const activeOtp = await this.prisma.loginOtp.findFirst({
      where: {
        userId: user.id,
        consumedAt: null,
        expiresAt: {
          gt: new Date(),
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (activeOtp) {
      if (Date.now() - activeOtp.lastSentAt.getTime() < OTP_RESEND_COOLDOWN_MS) {
        throw new BadRequestException('Please wait before requesting another OTP.');
      }

      if (activeOtp.resendCount >= OTP_MAX_RESENDS) {
        throw new BadRequestException(
          'Too many OTP resend requests. Please try again later.',
        );
      }
    }

    const otp = this.createEmailOtp();
    const loginOtp = activeOtp
      ? await this.prisma.loginOtp.update({
          where: {
            id: activeOtp.id,
          },
          data: {
            codeHash: this.hashEmailOtp(otp),
            expiresAt: this.createOtpExpiry(),
            consumedAt: null,
            attemptCount: 0,
            resendCount: {
              increment: 1,
            },
            lastSentAt: new Date(),
          },
        })
      : await this.prisma.loginOtp.create({
          data: {
            userId: user.id,
            codeHash: this.hashEmailOtp(otp),
            expiresAt: this.createOtpExpiry(),
            attemptCount: 0,
            resendCount: 0,
            lastSentAt: new Date(),
          },
        });

    await this.notificationsService.sendEmailVerificationOtp({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      code: otp,
      expiresInMinutes: OTP_EXPIRES_IN_MINUTES,
    });

    return {
      email: user.email,
      sent: true,
      expiresInMinutes: OTP_EXPIRES_IN_MINUTES,
      resendCount: loginOtp.resendCount,
    };
  }

  async verifyLoginOtp(emailInput: string, code: string, context: SessionContext) {
    this.assertJwtConfigured();

    await this.cleanupExpiredLoginOtps();
    const email = emailInput.trim().toLowerCase();
    const trimmedCode = code.trim();

    if (!/^\d{6}$/.test(trimmedCode)) {
      throw new BadRequestException('Enter the 6-digit OTP.');
    }

    const user = await this.usersService.findByEmail(email);

    if (!user) {
      throw new BadRequestException(
        'No account found with this email. Please create an account.',
      );
    }

    const loginOtp = await this.prisma.loginOtp.findFirst({
      where: {
        userId: user.id,
        consumedAt: null,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!loginOtp || loginOtp.expiresAt <= new Date()) {
      throw new BadRequestException('OTP expired. Please request a new code.');
    }

    if (loginOtp.attemptCount >= OTP_MAX_ATTEMPTS) {
      throw new BadRequestException(
        'Too many attempts. Please request a new code.',
      );
    }

    if (!this.safeCompare(this.hashEmailOtp(trimmedCode), loginOtp.codeHash)) {
      await this.prisma.loginOtp.update({
        where: {
          id: loginOtp.id,
        },
        data: {
          attemptCount: {
            increment: 1,
          },
        },
      });

      throw new BadRequestException('Invalid OTP.');
    }

    await this.prisma.loginOtp.update({
      where: {
        id: loginOtp.id,
      },
      data: {
        consumedAt: new Date(),
      },
    });

    return this.createAuthResult(user, context);
  }

  async googleLogin(dto: GoogleLoginDto, context: SessionContext) {
    this.assertJwtConfigured();

    if (!this.googleClientId) {
      throw new ServiceUnavailableException('Google login is not configured.');
    }

    const ticket = await this.googleClient.verifyIdToken({
      idToken: dto.idToken,
      audience: this.googleClientId,
    });
    const payload = ticket.getPayload();

    if (!payload?.sub || !payload.email) {
      throw new UnauthorizedException('Invalid Google token.');
    }

    const user = await this.usersService.upsertGoogleUser({
      name: payload.name ?? payload.email,
      email: payload.email,
      providerAccountId: payload.sub,
      emailVerified: payload.email_verified ?? false,
    });

    return this.createAuthResult(user, context);
  }

  async refresh(refreshToken: string | undefined, context: SessionContext) {
    this.assertJwtConfigured();

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token is required.');
    }

    const tokenHash = this.hashRefreshToken(refreshToken);
    const session = await this.prisma.refreshSession.findUnique({
      where: {
        refreshTokenHash: tokenHash,
      },
      include: {
        user: true,
      },
    });

    if (!session || session.revokedAt || session.expiresAt <= new Date()) {
      throw new UnauthorizedException('Invalid refresh session.');
    }

    await this.prisma.refreshSession.update({
      where: {
        id: session.id,
      },
      data: {
        revokedAt: new Date(),
      },
    });

    return this.createAuthResult(session.user, context);
  }

  async logout(refreshToken: string | undefined) {
    if (!refreshToken || !this.refreshSecret) {
      return;
    }

    const tokenHash = this.hashRefreshToken(refreshToken);

    await this.prisma.refreshSession.updateMany({
      where: {
        refreshTokenHash: tokenHash,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });
  }

  async getMe(userId: string) {
    const user = await this.usersService.findById(userId);

    if (!user) {
      throw new UnauthorizedException('User not found.');
    }

    return this.usersService.serializeUser(user);
  }

  async resendEmailVerificationOtp(emailInput: string) {
    this.assertJwtConfigured();

    await this.cleanupExpiredPendingRegistrations();
    const email = emailInput.trim().toLowerCase();
    const existingUser = await this.usersService.findByEmail(email);

    if (existingUser) {
      return {
        alreadyVerified: true,
        sent: false,
        expiresInMinutes: 0,
      };
    }

    const pending = await this.prisma.pendingRegistration.findUnique({
      where: {
        email,
      },
    });

    if (!pending) {
      throw new BadRequestException('No pending registration found for this email.');
    }

    if (Date.now() - pending.lastSentAt.getTime() < OTP_RESEND_COOLDOWN_MS) {
      throw new BadRequestException('Please wait before requesting another OTP.');
    }

    if (pending.resendCount >= OTP_MAX_RESENDS) {
      throw new BadRequestException(
        'Too many OTP resend requests. Please register again later.',
      );
    }

    const otp = this.createEmailOtp();
    const updatedPending = await this.prisma.pendingRegistration.update({
      where: {
        id: pending.id,
      },
      data: {
        otpHash: this.hashEmailOtp(otp),
        otpExpiresAt: this.createOtpExpiry(),
        otpAttemptCount: 0,
        resendCount: {
          increment: 1,
        },
        lastSentAt: new Date(),
      },
    });

    await this.notificationsService.sendEmailVerificationOtp({
      user: {
        name: updatedPending.name,
        email: updatedPending.email,
      },
      code: otp,
      expiresInMinutes: OTP_EXPIRES_IN_MINUTES,
    });

    return {
      alreadyVerified: false,
      sent: true,
      expiresInMinutes: OTP_EXPIRES_IN_MINUTES,
    };
  }

  async verifyEmailOtp(emailInput: string, code: string, context: SessionContext) {
    this.assertJwtConfigured();

    await this.cleanupExpiredPendingRegistrations();
    const email = emailInput.trim().toLowerCase();
    const trimmedCode = code.trim();

    if (!/^\d{6}$/.test(trimmedCode)) {
      throw new BadRequestException('Enter the 6-digit OTP.');
    }

    const pending = await this.prisma.pendingRegistration.findUnique({
      where: {
        email,
      },
    });

    if (!pending) {
      throw new BadRequestException('OTP expired. Please register again.');
    }

    if (pending.otpExpiresAt <= new Date()) {
      await this.prisma.pendingRegistration.delete({
        where: {
          id: pending.id,
        },
      });
      throw new BadRequestException('OTP expired. Please request a new code.');
    }

    if (pending.otpAttemptCount >= OTP_MAX_ATTEMPTS) {
      throw new BadRequestException(
        'Too many attempts. Please request a new code.',
      );
    }

    if (!this.safeCompare(this.hashEmailOtp(trimmedCode), pending.otpHash)) {
      await this.prisma.pendingRegistration.update({
        where: {
          id: pending.id,
        },
        data: {
          otpAttemptCount: {
            increment: 1,
          },
        },
      });

      throw new BadRequestException('Invalid OTP.');
    }

    const user = await this.prisma.$transaction(async (tx) => {
      const existingUser = await tx.user.findUnique({
        where: {
          email,
        },
      });

      if (existingUser) {
        await tx.pendingRegistration.delete({
          where: {
            id: pending.id,
          },
        });

        return existingUser;
      }

      const createdUser = await tx.user.create({
        data: {
          name: pending.name,
          email: pending.email,
          passwordHash: pending.passwordHash,
          role: UserRole.CUSTOMER,
          emailVerified: true,
          authAccounts: {
            create: {
              provider: AuthProvider.EMAIL,
              providerAccountId: pending.email,
            },
          },
        },
      });

      await tx.pendingRegistration.delete({
        where: {
          id: pending.id,
        },
      });

      return createdUser;
    });

    return this.createAuthResult(user, context);
  }

  verifyAccessToken(token: string) {
    this.assertJwtConfigured();
    const payload = this.verifyJwt(token);

    if (payload.type !== 'access') {
      throw new UnauthorizedException('Invalid access token.');
    }

    return payload;
  }

  getAccessTokenMaxAgeMs() {
    return this.parseDurationMs(this.accessExpiresIn);
  }

  getRefreshTokenMaxAgeMs() {
    return this.parseDurationMs(this.refreshExpiresIn);
  }

  private async createAuthResult(user: User, context: SessionContext) {
    const accessToken = this.signAccessToken(user);
    const refreshToken = this.createRefreshToken();
    const expiresAt = new Date(Date.now() + this.getRefreshTokenMaxAgeMs());

    await this.prisma.refreshSession.create({
      data: {
        userId: user.id,
        refreshTokenHash: this.hashRefreshToken(refreshToken),
        expiresAt,
        userAgent: context.userAgent,
        ipAddress: context.ipAddress,
      },
    });

    return {
      user: this.usersService.serializeUser(user),
      accessToken,
      refreshToken,
    };
  }

  private signAccessToken(user: User) {
    return this.signJwt({
      sub: user.id,
      email: user.email,
      role: user.role,
      type: 'access',
    });
  }

  private signJwt(payload: JwtPayload) {
    const nowInSeconds = Math.floor(Date.now() / 1000);
    const body = {
      ...payload,
      iat: nowInSeconds,
      exp: nowInSeconds + Math.floor(this.getAccessTokenMaxAgeMs() / 1000),
    };
    const encodedHeader = this.base64UrlEncode(
      JSON.stringify({ alg: 'HS256', typ: 'JWT' }),
    );
    const encodedPayload = this.base64UrlEncode(JSON.stringify(body));
    const signature = this.createJwtSignature(`${encodedHeader}.${encodedPayload}`);

    return `${encodedHeader}.${encodedPayload}.${signature}`;
  }

  private verifyJwt(token: string): JwtPayload {
    const [encodedHeader, encodedPayload, signature] = token.split('.');

    if (!encodedHeader || !encodedPayload || !signature) {
      throw new UnauthorizedException('Invalid access token.');
    }

    const expectedSignature = this.createJwtSignature(
      `${encodedHeader}.${encodedPayload}`,
    );

    if (!this.safeCompare(signature, expectedSignature)) {
      throw new UnauthorizedException('Invalid access token.');
    }

    const payload = JSON.parse(
      Buffer.from(encodedPayload, 'base64url').toString('utf8'),
    ) as JwtPayload & { exp?: number };

    if (!payload.exp || payload.exp <= Math.floor(Date.now() / 1000)) {
      throw new UnauthorizedException('Access token expired.');
    }

    return payload;
  }

  private createJwtSignature(value: string) {
    return createHmac('sha256', this.accessSecret).update(value).digest('base64url');
  }

  private base64UrlEncode(value: string) {
    return Buffer.from(value).toString('base64url');
  }

  private createRefreshToken() {
    return randomBytes(48).toString('base64url');
  }

  private hashRefreshToken(refreshToken: string) {
    return createHmac('sha256', this.refreshSecret)
      .update(refreshToken)
      .digest('hex');
  }

  private createEmailOtp() {
    return randomInt(100000, 1000000).toString();
  }

  private createOtpExpiry() {
    return new Date(Date.now() + OTP_EXPIRES_IN_MINUTES * 60 * 1000);
  }

  private async cleanupExpiredPendingRegistrations() {
    await this.prisma.pendingRegistration.deleteMany({
      where: {
        otpExpiresAt: {
          lt: new Date(),
        },
      },
    });
  }

  private async cleanupExpiredLoginOtps() {
    await this.prisma.loginOtp.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });
  }

  private hashEmailOtp(code: string) {
    return createHmac('sha256', this.refreshSecret || this.accessSecret)
      .update(code)
      .digest('hex');
  }

  private async hashPassword(password: string) {
    const salt = randomBytes(16).toString('base64url');
    const derivedKey = (await scrypt(password, salt, 64)) as Buffer;

    return `scrypt$${salt}$${derivedKey.toString('base64url')}`;
  }

  private async verifyPassword(password: string, passwordHash: string) {
    const [scheme, salt, key] = passwordHash.split('$');

    if (scheme !== 'scrypt' || !salt || !key) {
      return false;
    }

    const expectedKey = Buffer.from(key, 'base64url');
    const actualKey = (await scrypt(password, salt, expectedKey.length)) as Buffer;

    return this.safeCompare(actualKey, expectedKey);
  }

  private safeCompare(first: string | Buffer, second: string | Buffer) {
    const firstBuffer = Buffer.isBuffer(first) ? first : Buffer.from(first);
    const secondBuffer = Buffer.isBuffer(second) ? second : Buffer.from(second);

    return (
      firstBuffer.length === secondBuffer.length &&
      timingSafeEqual(firstBuffer, secondBuffer)
    );
  }

  private parseDurationMs(value: string) {
    const match = value.match(/^(\d+)(ms|s|m|h|d)$/);

    if (!match) {
      return 15 * 60 * 1000;
    }

    const amount = Number(match[1]);
    const unit = match[2];
    const multipliers: Record<string, number> = {
      ms: 1,
      s: 1000,
      m: 60 * 1000,
      h: 60 * 60 * 1000,
      d: 24 * 60 * 60 * 1000,
    };

    return amount * multipliers[unit];
  }

  private assertJwtConfigured() {
    if (!this.accessSecret || !this.refreshSecret) {
      throw new ServiceUnavailableException('Authentication is not configured.');
    }
  }

}
