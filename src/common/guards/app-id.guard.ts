//src/guards/app-id.guard.ts
import {
  Injectable,
  CanActivate,
  ExecutionContext,
} from '@nestjs/common';
import { Request } from 'express';
import { APP_CONTEXT_CONSTANTS } from '../constants/app-context.constants';
import { AppContextService } from '../../modules/app-context/app-context.service';

@Injectable()
export class AppIdGuard implements CanActivate {
  constructor(private readonly appContextService: AppContextService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const appId =
      this.extractAppId(request) || APP_CONTEXT_CONSTANTS.DEFAULT_APP_ID;
    const application =
      await this.appContextService.resolveApplicationContext(appId);

    request.appId = application.appId;
    request.application = application;
    return true;
  }

  private extractAppId(request: Request): string | null {
    const appId =
      (request.headers[APP_CONTEXT_CONSTANTS.APP_ID_HEADER] as string) ||
      (request.query['appId'] as string) ||
      (request.body?.appId as string);

    return appId || null;
  }
}
