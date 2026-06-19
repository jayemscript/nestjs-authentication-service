import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
} from 'class-validator';
import { APP_CONTEXT_CONSTANTS } from 'src/common/constants/app-context.constants';
import { REGEX } from 'src/common/constants/regex.constants';
import { ApplicationStatus } from 'src/common/enums/application-status.enum';

export class CreateApplicationDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(APP_CONTEXT_CONSTANTS.APP_ID_MAX_LENGTH)
  @Matches(REGEX.APP_ID, {
    message:
      'appId must contain lowercase letters, numbers, and hyphens only',
  })
  appId!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(ApplicationStatus)
  @IsOptional()
  status?: ApplicationStatus;

  @IsInt()
  @Min(1)
  @IsOptional()
  refreshTokenExpirationSeconds?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  maxSessionsPerUser?: number;

  @IsBoolean()
  @IsOptional()
  strictIpValidation?: boolean;
}
