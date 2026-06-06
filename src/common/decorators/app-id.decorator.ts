//src/commons/decorators/app-id.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

export const AppId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>();
    return (
      request['appId'] ||
      (request.headers['x-app-id'] as string) ||
      (request.query['appId'] as string)
    );
  },
);