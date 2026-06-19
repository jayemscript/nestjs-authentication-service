import { ApplicationStatus } from 'src/common/enums/application-status.enum';

export class AppContextDto {
  appId!: string;
  name!: string;
  status!: ApplicationStatus;
  refreshTokenExpirationSeconds!: number;
  maxSessionsPerUser!: number;
  strictIpValidation!: boolean;
}
