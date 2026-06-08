import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Session } from '../entities/session.entity';
import { SessionStatus } from 'src/common/enums/session-status.enum';

@Injectable()
export class SessionRepository extends Repository<Session> {
  constructor(private readonly dataSource: DataSource) {
    super(Session, dataSource.createEntityManager());
  }

  async createSession(data: Partial<Session>): Promise<Session> {
    const session = this.create(data);
    return this.save(session);
  }

  async findById(id: string): Promise<Session | null> {
    return this.findOne({ where: { id } });
  }

  async findActiveByUserId(userId: string): Promise<Session[]> {
    return this.find({
      where: { userId, status: SessionStatus.ACTIVE },
      order: { createdAt: 'DESC' },
    });
  }

  async findByUserIdAndFingerprint(
    userId: string,
    fingerprint: string,
  ): Promise<Session | null> {
    return this.findOne({
      where: {
        userId,
        deviceFingerprint: fingerprint,
        status: SessionStatus.ACTIVE,
      },
    });
  }

  async revokeSession(id: string): Promise<void> {
    await this.update(id, {
      status: SessionStatus.REVOKED,
      revokedAt: new Date(),
    });
  }

  async revokeAllByUserId(
    userId: string,
    excludeSessionId?: string,
  ): Promise<number> {
    const qb = this.createQueryBuilder()
      .update(Session)
      .set({ status: SessionStatus.REVOKED, revokedAt: new Date() })
      .where('user_id = :userId', { userId })
      .andWhere('status = :status', { status: SessionStatus.ACTIVE });

    if (excludeSessionId) {
      qb.andWhere('id != :excludeSessionId', { excludeSessionId });
    }

    const result = await qb.execute();
    return result.affected ?? 0;
  }

  async countActiveByUserId(userId: string): Promise<number> {
    return this.count({
      where: { userId, status: SessionStatus.ACTIVE },
    });
  }

  async updateLastActivity(id: string): Promise<void> {
    await this.update(id, { lastActivityAt: new Date() });
  }

  async cleanupInvalidSessions(): Promise<number> {
    const result = await this.createQueryBuilder()
      .delete()
      .from(Session)
      .where('status IN (:...statuses)', {
        statuses: [SessionStatus.REVOKED, SessionStatus.EXPIRED],
      })
      .orWhere('expires_at < :now', { now: new Date() })
      .execute();

    return result.affected ?? 0;
  }
}
