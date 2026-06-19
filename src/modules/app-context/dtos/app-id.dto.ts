import { IsNotEmpty, IsString, Matches, MaxLength } from 'class-validator';
import { APP_CONTEXT_CONSTANTS } from 'src/common/constants/app-context.constants';
import { REGEX } from 'src/common/constants/regex.constants';

export class AppIdDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(APP_CONTEXT_CONSTANTS.APP_ID_MAX_LENGTH)
  @Matches(REGEX.APP_ID, {
    message:
      'appId must contain lowercase letters, numbers, and hyphens only',
  })
  appId!: string;
}
