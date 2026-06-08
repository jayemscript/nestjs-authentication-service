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

@Injectable()
export class SessionsService {
  constructor(
    private readonly sessionRepository: SessionRepository,
    private readonly configService: ConfigService,
  ) {}

  async createSession(userId: string, req: Request): Promise<Session> {
    const deviceInfo = DeviceFingerprintUtil.extractDeviceInfo(req);
    const fingerprint =
      DeviceFingerprintUtil.generateDeviceFingerprint(deviceInfo);

    const existingSession =
      await this.sessionRepository.findByUserIdAndFingerprint(
        userId,
        fingerprint,
      );

    if (existingSession) {
      await this.sessionRepository.updateLastActivity(existingSession.id);
      return existingSession;
    }

    const maxSessions = parseInt(
      this.configService.get<string>('MAX_SESSIONS_PER_USER') || '5',
      10,
    );

    if (maxSessions > 0) {
      const activeCount =
        await this.sessionRepository.countActiveByUserId(userId);

      if (activeCount >= maxSessions) {
        const activeSessions =
          await this.sessionRepository.findActiveByUserId(userId);
        const oldest = activeSessions[activeSessions.length - 1];
        if (oldest) {
          await this.sessionRepository.revokeSession(oldest.id);
        }
      }
    }

    const refreshExpiration = parseInt(
      this.configService.get<string>('JWT_REFRESH_EXPIRATION') || '2592000',
      10,
    );

    const session = await this.sessionRepository.createSession({
      userId,
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
  ): Promise<ActiveSessionsResponseDto> {
    const sessions =
      await this.sessionRepository.findActiveByUserId(userId);

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

  async revokeAllSessions(userId: string): Promise<{ message: string }> {
    await this.sessionRepository.revokeAllByUserId(userId);
    return { message: MESSAGES.SESSION.ALL_SESSIONS_REVOKED };
  }

  async revokeOtherSessions(
    userId: string,
    currentSessionId: string,
  ): Promise<{ message: string }> {
    await this.sessionRepository.revokeAllByUserId(userId, currentSessionId);
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
      deviceType: session.deviceType,
      deviceName: session.deviceName,
      ipAddress: session.ipAddress,
      status: session.status,
      lastActivityAt: session.lastActivityAt,
      createdAt: session.createdAt,
      isCurrent: session.id === currentSessionId,
    };
  }
}
