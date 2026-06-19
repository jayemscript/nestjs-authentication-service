import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { ApplicationStatus } from 'src/common/enums/application-status.enum';

export class UpdateApplicationDto {
  @IsString()
  @MaxLength(100)
  @IsOptional()
  name?: string;

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
