import {
  Controller,
  Get,
  Delete,
  Param,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { CurrentSession } from 'src/common/decorators/current-session.decorator';
import { AppId } from 'src/common/decorators/app-id.decorator';
import { Private } from 'src/common/decorators/private.decorator';
import { ActiveSessionsResponseDto } from './dtos/session.dto';
import { User } from '../users/entities/user.entity';

@Controller('sessions')
@UseGuards(AuthGuard)
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) { }

  @Private()
  @Get()
  async getActiveSessions(
    @CurrentUser() user: User,
    @CurrentSession() sessionId: string,
    @AppId() appId: string,
  ): Promise<ActiveSessionsResponseDto> {
    return this.sessionsService.getActiveSessions(user.id, sessionId, appId);
  }

  @Private()
  @Delete('revoke-others')
  async revokeOtherSessions(
    @CurrentUser() user: User,
    @CurrentSession() sessionId: string,
    @AppId() appId: string,
  ): Promise<{ message: string }> {
    return this.sessionsService.revokeOtherSessions(user.id, sessionId, appId);
  }

  @Private()
  @Delete('revoke-current/:id')
  async revokeSession(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ): Promise<{ message: string }> {
    return this.sessionsService.revokeSession(id, user.id);
  }

  @Private()
  @Delete('revoke-all')
  async revokeAllSessions(
    @CurrentUser() user: User,
    @AppId() appId: string,
  ): Promise<{ message: string }> {
    return this.sessionsService.revokeAllSessions(user.id, appId);
  }
}
