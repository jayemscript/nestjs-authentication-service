//src/common/guards/auth.guard.ts
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Inject,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { MESSAGES } from '../constants/messages.constants';
import { SessionsService } from '../../modules/sessions/sessions.service';
import { AppContextService } from '../../modules/app-context/app-context.service';
import { CookieUtil } from '../utils/cookie.util';
import { APP_CONTEXT_CONSTANTS } from '../constants/app-context.constants';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @Inject(SessionsService)
    private readonly sessionsService: SessionsService,
    @Inject(AppContextService)
    private readonly appContextService: AppContextService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const token = this.extractToken(request);

    if (!token) {
      CookieUtil.clearAllCookies(response);
      throw new UnauthorizedException(MESSAGES.ERROR.UNAUTHORIZED);
    }

    try {
      const payload = this.jwtService.verify(token);
      const requestAppId = this.resolveRequestAppId(request);
      const payloadAppId =
        payload.appId || APP_CONTEXT_CONSTANTS.DEFAULT_APP_ID;

      if (payloadAppId !== requestAppId) {
        throw new UnauthorizedException(MESSAGES.ERROR.INVALID_TOKEN);
      }

      request['user'] = payload;
      request.appId = requestAppId;

      if (
        this.configService.get<string>('FEATURE_SESSION_TRACKING') === 'true'
      ) {
        if (!payload.sessionId) {
          throw new UnauthorizedException(MESSAGES.ERROR.INVALID_TOKEN);
        }

        request['session'] = payload.sessionId;

        const isValid = await this.sessionsService.validateSessionForApp(
          payload.sessionId,
          requestAppId,
        );

        if (!isValid) {
          throw new UnauthorizedException(MESSAGES.ERROR.INVALID_TOKEN);
        }

        // ── Strict IP Validation ──────────────────────────────────────────
        // Runs only when session tracking is enabled since we need a session
        // to compare IPs against. Plug-and-play — just set strictIpValidation
        // to true on the application record in the database to enable it.
        const application =
          await this.appContextService.resolveApplicationContext(requestAppId);

        if (application.strictIpValidation) {
          const sessionIp = await this.sessionsService.getSessionIp(
            payload.sessionId,
          );
          const requestIp =
            (request.headers['x-forwarded-for'] as string)
              ?.split(',')[0]
              .trim() || request.ip;

          if (sessionIp && sessionIp !== requestIp) {
            CookieUtil.clearAllCookies(response);
            throw new UnauthorizedException(
              MESSAGES.ERROR.SESSION_IP_MISMATCHED,
            );
          }
        }
        // ─────────────────────────────────────────────────────────────────
      } else if (payload.sessionId) {
        request['session'] = payload.sessionId;
      }

      return true;
    } catch (error) {
      CookieUtil.clearAllCookies(response);
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException(MESSAGES.ERROR.INVALID_TOKEN);
    }
  }

  private extractToken(request: Request): string | null {
    const authHeader = request.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }
    return null;
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
