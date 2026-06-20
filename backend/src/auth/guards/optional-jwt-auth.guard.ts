import { CanActivate, ExecutionContext, Inject, Injectable } from '@nestjs/common';
import { ACCESS_TOKEN_COOKIE } from '../auth.constants';
import { AuthService } from '../auth.service';
import { AuthenticatedRequest } from '../types/authenticated-request';

@Injectable()
export class OptionalJwtAuthGuard implements CanActivate {
  constructor(@Inject(AuthService) private readonly authService: AuthService) {}

  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const accessToken =
      request.cookies?.[ACCESS_TOKEN_COOKIE] ?? this.getBearerToken(request);

    if (!accessToken) {
      return true;
    }

    try {
      const payload = this.authService.verifyAccessToken(accessToken);
      request.user = {
        id: payload.sub,
        email: payload.email,
        role: payload.role,
      };
    } catch {
      return true;
    }

    return true;
  }

  private getBearerToken(request: AuthenticatedRequest) {
    const authorizationHeader = request.headers.authorization;

    if (!authorizationHeader?.startsWith('Bearer ')) {
      return undefined;
    }

    return authorizationHeader.slice('Bearer '.length);
  }
}
