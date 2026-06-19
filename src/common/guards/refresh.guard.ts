//src/common/guards/refresh.guard.ts
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { JwtService } from '@nestjs/jwt';
import { AUTH_CONSTANTS } from '../constants/auth.constants';
import { MESSAGES } from '../constants/messages.constants';
import { CookieUtil } from '../utils/cookie.util';
import { APP_CONTEXT_CONSTANTS } from '../constants/app-context.constants';

@Injectable()
export class RefreshGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const token = this.extractRefreshToken(request);

    if (!token) {
      CookieUtil.clearAllCookies(response);
      throw new UnauthorizedException(MESSAGES.ERROR.UNAUTHORIZED);
    }

    try {
      const payload = this.jwtService.verify(token);
      const requestAppId = this.resolveRequestAppId(request);
      const payloadAppId = payload.appId || APP_CONTEXT_CONSTANTS.DEFAULT_APP_ID;

      if (payloadAppId !== requestAppId) {
        throw new UnauthorizedException(MESSAGES.ERROR.INVALID_TOKEN);
      }

      request['user'] = payload;
      return true;
    } catch (error) {
      CookieUtil.clearAllCookies(response);
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException(MESSAGES.ERROR.TOKEN_EXPIRED);
    }
  }

  private extractRefreshToken(request: Request): string | null {
    const cookies = request.cookies;
    return cookies?.[AUTH_CONSTANTS.COOKIE_NAMES.REFRESH_TOKEN] || null;
  }

  private resolveRequestAppId(request: Request): string {
    return (
      request.appId ||
      (request.headers[APP_CONTEXT_CONSTANTS.APP_ID_HEADER] as string) ||
      (request.query['appId'] as string) ||
      APP_CONTEXT_CONSTANTS.DEFAULT_APP_ID
    );
  }
}
