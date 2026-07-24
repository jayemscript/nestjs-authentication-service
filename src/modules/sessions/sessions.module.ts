import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SessionsController } from './sessions.controller';
import { SessionsService } from './sessions.service';
import { SessionRepository } from './repositories/session.repository';
import { Session } from './entities/session.entity';
import { AppContextModule } from '../app-context/app-context.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Session]),
    forwardRef(() => AppContextModule),
    forwardRef(() => UsersModule),
  ],
  controllers: [SessionsController],
  providers: [SessionsService, SessionRepository],
  exports: [SessionsService],
})
export class SessionsModule {}
