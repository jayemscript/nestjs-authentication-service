//src/common/types/request.types.ts
import { Request } from 'express';
import { ApplicationContext } from './application-context.types';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        username: string;
        iat?: number;
        exp?: number;
      };
      session?: string;
      appId?: string;
      application?: ApplicationContext;
    }
  }
}
