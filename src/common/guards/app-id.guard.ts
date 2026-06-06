//src/guards/app-id.guard.ts
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  BadRequestException,
} from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class AppIdGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const appId = this.extractAppId(request);

    if (!appId) {
      throw new BadRequestException('appId is required');
    }

    request['appId'] = appId;
    return true;
  }

  private extractAppId(request: Request): string | null {
    const appId =
      (request.headers['x-app-id'] as string) ||
      (request.query['appId'] as string) ||
      (request.body?.appId as string);

    return appId || null;
  }
}