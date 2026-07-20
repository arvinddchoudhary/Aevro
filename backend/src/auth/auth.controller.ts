import {
  Body,
  Controller,
  Get,
  Inject,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FastifyReply } from 'fastify';
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
} from './auth.constants';
import { AuthService } from './auth.service';
import { GoogleLoginDto } from './dto/google-login.dto';
import { LoginDto } from './dto/login.dto';
import { SendLoginOtpDto, VerifyLoginOtpDto } from './dto/login-otp.dto';
import { RegisterDto } from './dto/register.dto';
import { ResendEmailOtpDto } from './dto/resend-email-otp.dto';
import { VerifyEmailOtpDto } from './dto/verify-email-otp.dto';
import { ResetPasswordDto, SendPasswordResetOtpDto, VerifyPasswordResetOtpDto } from './dto/password-reset.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AuthenticatedRequest } from './types/authenticated-request';

type AuthResult = Awaited<ReturnType<AuthService['login']>>;

@Controller('auth')
export class AuthController {
  constructor(
    @Inject(AuthService) private readonly authService: AuthService,
    @Inject(ConfigService) private readonly configService: ConfigService,
  ) {}

  @Post('register')
  async register(
    @Body() dto: RegisterDto,
    @Req() request: AuthenticatedRequest,
  ) {
    const result = await this.authService.register(dto, this.getSessionContext(request));

    return {
      success: true,
      data: {
        email: result.email,
        emailVerification: result.emailVerification,
      },
    };
  }

  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Req() request: AuthenticatedRequest,
    @Res({ passthrough: true }) reply: FastifyReply,
  ) {
    const result = await this.authService.login(dto, this.getSessionContext(request));
    this.setAuthCookies(reply, result);

    return {
      success: true,
      data: {
        user: result.user,
      },
    };
  }

  @Post('login/send-otp')
  async sendLoginOtp(@Body() dto: SendLoginOtpDto) {
    const result = await this.authService.sendLoginOtp(dto.email);

    return {
      success: true,
      data: result,
    };
  }

  @Post('login/verify-otp')
  async verifyLoginOtp(
    @Body() dto: VerifyLoginOtpDto,
    @Req() request: AuthenticatedRequest,
    @Res({ passthrough: true }) reply: FastifyReply,
  ) {
    const result = await this.authService.verifyLoginOtp(
      dto.email,
      dto.code,
      this.getSessionContext(request),
    );
    this.setAuthCookies(reply, result);

    return {
      success: true,
      data: {
        user: result.user,
      },
    };
  }

  @Post('password-reset/send-otp')
  async sendPasswordResetOtp(@Body() dto: SendPasswordResetOtpDto) {
    return { success: true, data: await this.authService.sendPasswordResetOtp(dto.email) };
  }

  @Post('password-reset/verify-otp')
  async verifyPasswordResetOtp(@Body() dto: VerifyPasswordResetOtpDto) {
    return { success: true, data: await this.authService.verifyPasswordResetOtp(dto.email, dto.code) };
  }

  @Post('password-reset')
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return { success: true, data: await this.authService.resetPassword(dto.email, dto.resetToken, dto.password) };
  }

  @Post('google')
  async googleLogin(
    @Body() dto: GoogleLoginDto,
    @Req() request: AuthenticatedRequest,
    @Res({ passthrough: true }) reply: FastifyReply,
  ) {
    const result = await this.authService.googleLogin(
      dto,
      this.getSessionContext(request),
    );
    this.setAuthCookies(reply, result);

    return {
      success: true,
      data: {
        user: result.user,
      },
    };
  }

  @Post('refresh')
  async refresh(
    @Req() request: AuthenticatedRequest,
    @Res({ passthrough: true }) reply: FastifyReply,
  ) {
    let result: AuthResult;

    try {
      result = await this.authService.refresh(
        request.cookies?.[REFRESH_TOKEN_COOKIE],
        this.getSessionContext(request),
      );
    } catch (error) {
      this.clearAuthCookies(reply);
      throw error;
    }

    this.setAuthCookies(reply, result);

    return {
      success: true,
      data: {
        user: result.user,
      },
    };
  }

  @Post('logout')
  async logout(
    @Req() request: AuthenticatedRequest,
    @Res({ passthrough: true }) reply: FastifyReply,
  ) {
    await this.authService.logout(request.cookies?.[REFRESH_TOKEN_COOKIE]);
    this.clearAuthCookies(reply);

    return {
      success: true,
      data: {
        loggedOut: true,
      },
    };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async me(@Req() request: AuthenticatedRequest) {
    const user = await this.authService.getMe(request.user?.id ?? '');

    return {
      success: true,
      data: {
        user,
      },
    };
  }

  @Post('verify-email-otp')
  async verifyEmailOtp(
    @Req() request: AuthenticatedRequest,
    @Body() dto: VerifyEmailOtpDto,
    @Res({ passthrough: true }) reply: FastifyReply,
  ) {
    const result = await this.authService.verifyEmailOtp(
      dto.email,
      dto.code,
      this.getSessionContext(request),
    );
    this.setAuthCookies(reply, result);

    return {
      success: true,
      data: {
        user: result.user,
      },
    };
  }

  @Post('resend-email-otp')
  async resendEmailOtp(@Body() dto: ResendEmailOtpDto) {
    const result = await this.authService.resendEmailVerificationOtp(
      dto.email,
    );

    return {
      success: true,
      data: result,
    };
  }

  private setAuthCookies(reply: FastifyReply, result: AuthResult) {
    reply.setCookie(ACCESS_TOKEN_COOKIE, result.accessToken, {
      ...this.getCookieOptions(),
      maxAge: Math.floor(this.authService.getAccessTokenMaxAgeMs() / 1000),
    });
    reply.setCookie(REFRESH_TOKEN_COOKIE, result.refreshToken, {
      ...this.getCookieOptions(),
      maxAge: Math.floor(this.authService.getRefreshTokenMaxAgeMs() / 1000),
      path: '/api/v1/auth',
    });
  }

  private clearAuthCookies(reply: FastifyReply) {
    reply.clearCookie(ACCESS_TOKEN_COOKIE, this.getCookieOptions());
    reply.clearCookie(REFRESH_TOKEN_COOKIE, {
      ...this.getCookieOptions(),
      path: '/api/v1/auth',
    });
  }

  private getCookieOptions() {
    const nodeEnv = this.configService.get<string>('NODE_ENV') ?? 'development';
    const cookieDomain = this.configService.get<string>('COOKIE_DOMAIN');
    const isProduction = nodeEnv === 'production';

    return {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      path: '/',
      domain: cookieDomain || undefined,
    } as const;
  }

  private getSessionContext(request: AuthenticatedRequest) {
    return {
      userAgent: request.headers['user-agent'],
      ipAddress: request.ip,
    };
  }
}
