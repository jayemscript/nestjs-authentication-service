import { CommonResponseDto } from 'src/common/dtos/common-response.dto';
import { Session } from 'src/modules/sessions/entities/session.entity';
import { UserApplication } from '../entities/user-application.entity';

export class UserProfileDto {
  id!: string;
  email!: string;
  username!: string;
  status!: string;
  lastLoginAt?: Date;
  createdAt!: Date;
  updatedAt!: Date;
  sessions?: Session[];
  userApplications?: UserApplication[];
}

export class UserProfileResponseDto extends UserProfileDto {}
