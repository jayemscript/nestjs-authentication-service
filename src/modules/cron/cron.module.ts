import { Module } from '@nestjs/common';
import { CronService } from './cron.service';
import { SessionsModule } from '../sessions/sessions.module';

@Module({
  imports: [SessionsModule],
  providers: [CronService],
})
export class CronModule {}
