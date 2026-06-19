import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { ApplicationStatus } from 'src/common/enums/application-status.enum';

export class CreateApplicationDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
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
