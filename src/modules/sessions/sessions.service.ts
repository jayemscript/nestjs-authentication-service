import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { SessionRepository } from './repositories/session.repository';
import { Session } from './entities/session.entity';
import { SessionDto, ActiveSessionsResponseDto } from './dtos/session.dto';
import { SessionStatus } from 'src/common/enums/session-status.enum';
import { DeviceFingerprintUtil } from 'src/common/utils/device-fingerprint.util';
import { MESSAGES } from 'src/common/constants/messages.constants';
import { APP_CONTEXT_CONSTANTS } from 'src/common/constants/app-context.constants';
import { ApplicationContext } from 'src/common/types/application-context.types';

@Injectable()
export class SessionsService {
  constructor(
    private readonly sessionRepository: SessionRepository,
    private readonly configService: ConfigService,
  ) {}

  async createSession(
    userId: string,
    req: Request,
    applicationContext?: ApplicationContext,
  ): Promise<Session> {
    const appContext = applicationContext || req.application;
    const appId = appContext?.appId || APP_CONTEXT_CONSTANTS.DEFAULT_APP_ID;
    const deviceInfo = DeviceFingerprintUtil.extractDeviceInfo(req);
    const fingerprint =
      DeviceFingerprintUtil.generateDeviceFingerprint(deviceInfo);

    const existingSession =
      await this.sessionRepository.findByUserIdAndFingerprint(
        userId,
        fingerprint,
        appId,
      );

    if (existingSession) {
      await this.sessionRepository.updateLastActivity(existingSession.id);
      return existingSession;
    }

    const maxSessions =
      appContext?.maxSessionsPerUser ??
      parseInt(
        this.configService.get<string>('MAX_SESSIONS_PER_USER') || '5',
        10,
      );

    if (maxSessions > 0) {
      const activeCount =
        await this.sessionRepository.countActiveByUserIdAndAppId(userId, appId);

      if (activeCount >= maxSessions) {
        const activeSessions =
          await this.sessionRepository.findActiveByUserIdAndAppId(
            userId,
            appId,
          );
        const oldest = activeSessions[activeSessions.length - 1];
        if (oldest) {
          await this.sessionRepository.revokeSession(oldest.id);
        }
      }
    }

    const refreshExpiration =
      appContext?.refreshTokenExpirationSeconds ??
      parseInt(
        this.configService.get<string>('JWT_REFRESH_EXPIRATION') || '2592000',
        10,
      );

    const session = await this.sessionRepository.createSession({
      userId,
      appId,
      deviceFingerprint: fingerprint,
      deviceType: deviceInfo.deviceType,
      deviceName: deviceInfo.deviceName,
      ipAddress: deviceInfo.ipAddress,
      userAgent: deviceInfo.userAgent,
      status: SessionStatus.ACTIVE,
      lastActivityAt: new Date(),
      expiresAt: new Date(Date.now() + refreshExpiration * 1000),
    });

    return session;
  }

  async getActiveSessions(
    userId: string,
    currentSessionId: string,
    appId?: string,
  ): Promise<ActiveSessionsResponseDto> {
    const sessions = appId
      ? await this.sessionRepository.findActiveByUserIdAndAppId(userId, appId)
      : await this.sessionRepository.findActiveByUserId(userId);

    const sessionDtos: SessionDto[] = sessions.map((session) =>
      this.mapToSessionDto(session, currentSessionId),
    );

    return {
      status: 200,
      message: MESSAGES.SESSION.SESSIONS_RETRIEVED,
      data: sessionDtos,
    };
  }

  async revokeSession(
    sessionId: string,
    userId: string,
  ): Promise<{ message: string }> {
    const session = await this.sessionRepository.findById(sessionId);

    if (!session) {
      throw new NotFoundException(MESSAGES.SESSION.SESSION_NOT_FOUND);
    }

    if (session.userId !== userId) {
      throw new ForbiddenException(MESSAGES.ERROR.FORBIDDEN);
    }

    await this.sessionRepository.revokeSession(sessionId);

    return { message: MESSAGES.SESSION.SESSION_REVOKED };
  }

  async revokeAllSessions(
    userId: string,
    appId?: string,
  ): Promise<{ message: string }> {
    await this.sessionRepository.revokeAllByUserId(userId, undefined, appId);
    return { message: MESSAGES.SESSION.ALL_SESSIONS_REVOKED };
  }

  async revokeOtherSessions(
    userId: string,
    currentSessionId: string,
    appId?: string,
  ): Promise<{ message: string }> {
    await this.sessionRepository.revokeAllByUserId(
      userId,
      currentSessionId,
      appId,
    );
    return { message: MESSAGES.SESSION.OTHER_SESSIONS_REVOKED };
  }

  async validateSession(sessionId: string): Promise<boolean> {
    const session = await this.sessionRepository.findById(sessionId);

    if (!session) {
      return false;
    }

    if (session.status !== SessionStatus.ACTIVE) {
      return false;
    }

    if (session.expiresAt < new Date()) {
      await this.sessionRepository.revokeSession(sessionId);
      return false;
    }

    return true;
  }

  async validateSessionForApp(
    sessionId: string,
    appId: string,
  ): Promise<boolean> {
    const session = await this.sessionRepository.findById(sessionId);

    if (!session || session.appId !== appId) {
      return false;
    }

    return this.validateSession(sessionId);
  }

  async updateLastActivity(sessionId: string): Promise<void> {
    await this.sessionRepository.updateLastActivity(sessionId);
  }

  async cleanupInvalidSessions(): Promise<number> {
    return this.sessionRepository.cleanupInvalidSessions();
  }

  private mapToSessionDto(
    session: Session,
    currentSessionId: string,
  ): SessionDto {
    return {
      id: session.id,
      appId: session.appId,
      deviceType: session.deviceType,
      deviceName: session.deviceName,
      ipAddress: session.ipAddress,
      status: session.status,
      lastActivityAt: session.lastActivityAt,
      createdAt: session.createdAt,
      isCurrent: session.id === currentSessionId,
    };
  }

  async getSessionIp(sessionId: string): Promise<string | null> {
    const session = await this.sessionRepository.findById(sessionId);
    return session?.ipAddress ?? null;
  }

  async getSessionById(sessionId: string): Promise<Session | null> {
    return this.sessionRepository.findById(sessionId);
  }
}
