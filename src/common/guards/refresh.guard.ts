//src/common/guards/refresh.guard.ts
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtService } from '@nestjs/jwt';
import { AUTH_CONSTANTS } from '../constants/auth.constants';
import { MESSAGES } from '../constants/messages.constants';

@Injectable()
export class RefreshGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractRefreshToken(request);

    if (!token) {
      throw new UnauthorizedException(MESSAGES.ERROR.UNAUTHORIZED);
    }

    try {
      const payload = this.jwtService.verify(token);
      request['user'] = payload;
      return true;
    } catch (error) {
      throw new UnauthorizedException(MESSAGES.ERROR.TOKEN_EXPIRED);
    }
  }

  private extractRefreshToken(request: Request): string | null {
    const cookies = request.cookies;
    return cookies?.[AUTH_CONSTANTS.COOKIE_NAMES.REFRESH_TOKEN] || null;
  }
}