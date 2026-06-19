import { CommonResponseDto } from 'src/common/dtos/common-response.dto';

export class SessionDto {
  id!: string;
  appId!: string;
  deviceType!: string;
  deviceName?: string;
  ipAddress!: string;
  status!: string;
  lastActivityAt?: Date;
  createdAt!: Date;
  isCurrent!: boolean;
}

export class ActiveSessionsResponseDto extends CommonResponseDto<SessionDto[]> {}
