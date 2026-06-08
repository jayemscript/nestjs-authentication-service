import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { DatabaseModule } from 'src/database';
import { HealthModule } from './modules/health/health.module';
import { JwtModule } from './modules/jwt.module';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { SessionsModule } from './modules/sessions/sessions.module';
import { CronModule } from './modules/cron/cron.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    ScheduleModule.forRoot(),
    JwtModule,
    AuthModule,
    UsersModule,
    SessionsModule,
    DatabaseModule,
    HealthModule,
    CronModule,
    // ThrottlerModule.forRoot([
    //   {
    //     name: 'global',
    //     ttl: 60000, // 1 minute
    //     limit: 200, // 200 requests/min
    //   },
    //   {
    //     name: 'auth',
    //     ttl: 60000, // 1 minute
    //     limit: 10, // 10 attempts/min
    //   },
    // ]),
  ],
  controllers: [],
  providers: [
    // {
    //   provide: APP_GUARD,
    //   useClass: ThrottlerGuard,
    // },
  ],
})
export class AppModule {}
