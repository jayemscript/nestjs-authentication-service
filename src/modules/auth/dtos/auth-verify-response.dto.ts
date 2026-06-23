// dtos/auth-verify-response.dto.ts

export class SessionMetaDto {
  id!: string;
  deviceType?: string;
  deviceName?: string;
  ipAddress!: string;
  lastActivityAt?: Date;
  createdAt!: Date;
}

export class VerifyDataDto {
  id!: string;
  email!: string;
  username!: string;
  appId!: string;
  lastLoginAt?: Date; // ← optional, matches entity
  session!: SessionMetaDto | null;
}

export class AuthVerifyResponseDto {
  status!: number;
  message!: string;
  data!: VerifyDataDto;
}
