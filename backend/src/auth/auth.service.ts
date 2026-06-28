import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { User, UserRole } from '@prisma/client';
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
  private readonly logger = new Logger(AuthService.name);
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

  async register(dto: RegisterDto, context: SessionContext) {
    this.assertJwtConfigured();

    const passwordHash = await this.hashPassword(dto.password);
    const user = await this.usersService.createEmailUser({
      name: dto.name.trim(),
      email: dto.email.trim(),
      passwordHash,
    });

    const result = await this.createAuthResult(user, context);
    let emailVerification = {
      sent: true,
      expiresInMinutes: 0,
      error: null as string | null,
    };

    try {
      const expiresInMinutes = await this.createAndSendEmailVerificationOtp(user);
      emailVerification = {
        sent: true,
        expiresInMinutes,
        error: null,
      };
    } catch (error) {
      const message = this.errorMessage(error);
      this.logger.warn(
        `Email verification OTP send failed | userId=${user.id} | email=${user.email} | error=${message}`,
      );
      emailVerification = {
        sent: false,
        expiresInMinutes: 0,
        error:
          'Account created, but the verification email could not be sent. Please use resend code.',
      };
    }

    return {
      ...result,
      emailVerification,
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

  async resendEmailVerificationOtp(userId: string) {
    this.assertJwtConfigured();

    const user = await this.usersService.findById(userId);

    if (!user) {
      throw new UnauthorizedException('User not found.');
    }

    if (user.emailVerified) {
      return {
        alreadyVerified: true,
        sent: false,
        expiresInMinutes: 0,
      };
    }

    const expiresInMinutes = await this.createAndSendEmailVerificationOtp(user);

    return {
      alreadyVerified: false,
      sent: true,
      expiresInMinutes,
    };
  }

  async verifyEmailOtp(userId: string, code: string) {
    this.assertJwtConfigured();

    const trimmedCode = code.trim();

    if (!/^\d{6}$/.test(trimmedCode)) {
      throw new BadRequestException('Enter the 6-digit OTP.');
    }

    const otp = await this.prisma.emailVerificationOtp.findFirst({
      where: {
        userId,
        consumedAt: null,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!otp || otp.expiresAt <= new Date()) {
      throw new BadRequestException('OTP expired. Please request a new code.');
    }

    if (otp.attempts >= 5) {
      throw new BadRequestException(
        'Too many attempts. Please request a new code.',
      );
    }

    if (!this.safeCompare(this.hashEmailOtp(trimmedCode), otp.codeHash)) {
      await this.prisma.emailVerificationOtp.update({
        where: {
          id: otp.id,
        },
        data: {
          attempts: {
            increment: 1,
          },
        },
      });

      throw new BadRequestException('Invalid OTP code.');
    }

    const user = await this.prisma.$transaction(async (tx) => {
      await tx.emailVerificationOtp.update({
        where: {
          id: otp.id,
        },
        data: {
          consumedAt: new Date(),
        },
      });

      return tx.user.update({
        where: {
          id: userId,
        },
        data: {
          emailVerified: true,
        },
      });
    });

    return this.usersService.serializeUser(user);
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

  private async createAndSendEmailVerificationOtp(user: User) {
    const code = randomInt(100000, 1000000).toString();
    const expiresInMinutes = 10;
    const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000);

    await this.prisma.$transaction([
      this.prisma.emailVerificationOtp.updateMany({
        where: {
          userId: user.id,
          consumedAt: null,
        },
        data: {
          consumedAt: new Date(),
        },
      }),
      this.prisma.emailVerificationOtp.create({
        data: {
          userId: user.id,
          codeHash: this.hashEmailOtp(code),
          expiresAt,
        },
      }),
    ]);

    await this.notificationsService.sendEmailVerificationOtp({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      code,
      expiresInMinutes,
    });

    return expiresInMinutes;
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

  private errorMessage(error: unknown) {
    return error instanceof Error ? error.message : 'Unknown error';
  }
}
