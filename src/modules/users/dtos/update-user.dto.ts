import { IsString, IsOptional, IsEmail, MinLength } from 'class-validator';
import { CommonResponseDto } from 'src/common/dtos/common-response.dto';
import { UserProfileDto } from './user-profile.dto';

export class UpdateUserDto {
  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  username?: string;

  @IsString()
  @IsOptional()
  @MinLength(8)
  password?: string;
}


export class UpdateUserResponseDto extends CommonResponseDto<UserProfileDto> {}