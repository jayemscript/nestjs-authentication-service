import { CommonResponseDto } from 'src/common/dtos/common-response.dto';

export class UserProfileDto {
  id!: string;
  email!: string;
  username!: string;
  status!: string;
  lastLoginAt?: Date;
  createdAt!: Date;
  updatedAt!: Date;
}

export class UserProfileResponseDto extends CommonResponseDto<UserProfileDto> {}
