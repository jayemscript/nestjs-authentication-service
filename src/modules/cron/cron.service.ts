import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SessionsService } from '../sessions/sessions.service';

@Injectable()
export class CronService {
  private readonly logger = new Logger(CronService.name);

  constructor(private readonly sessionsService: SessionsService) {}

  // Run at 00:00 every day
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async cleanupSessions() {
    this.logger.log('Starting scheduled session cleanup...');
    try {
      const deletedCount = await this.sessionsService.cleanupInvalidSessions();
      this.logger.log(`Session cleanup completed. Deleted ${deletedCount} invalid/expired sessions.`);
    } catch (error) {
      this.logger.error('Failed to execute session cleanup cron job', error);
    }
  }
}
