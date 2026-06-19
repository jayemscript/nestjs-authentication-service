import { ApplicationStatus } from 'src/common/enums/application-status.enum';

export class ApplicationDto {
  id!: string;
  appId!: string;
  name!: string;
  description?: string;
  status!: ApplicationStatus;
  refreshTokenExpirationSeconds!: number;
  maxSessionsPerUser!: number;
  strictIpValidation!: boolean;
  createdAt!: Date;
  updatedAt!: Date;
}
