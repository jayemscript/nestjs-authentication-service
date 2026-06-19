//src/common/types/application-context.types.ts
import { ApplicationStatus } from '../enums/application-status.enum';

export interface ApplicationContext {
  appId: string;
  name: string;
  status: ApplicationStatus;
  refreshTokenExpirationSeconds: number;
  maxSessionsPerUser: number;
  strictIpValidation: boolean;
}
