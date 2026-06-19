//src/commons/decorators/app-id.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { APP_CONTEXT_CONSTANTS } from '../constants/app-context.constants';

export const AppId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>();
    return (
      request.appId ||
      (request.headers[APP_CONTEXT_CONSTANTS.APP_ID_HEADER] as string) ||
      (request.query['appId'] as string) ||
      APP_CONTEXT_CONSTANTS.DEFAULT_APP_ID
    );
  },
);
