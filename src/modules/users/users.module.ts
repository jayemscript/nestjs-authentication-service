import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService, QueryUserService } from './services';
import { UserRepository } from './repositories/user.repository';
import { User } from './entities/user.entity';
import { Session } from '../sessions/entities/session.entity';
import { SessionsModule } from '../sessions/sessions.module';
import { AppContextModule } from '../app-context/app-context.module';
import { UserApplication } from './entities/user-application.entity';
import { PaginationModule } from '../../common/modules/pagination.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Session, UserApplication]),
    forwardRef(() => SessionsModule),
    AppContextModule,
    PaginationModule,
  ],
  controllers: [UsersController],
  providers: [UsersService, QueryUserService, UserRepository],
  exports: [UsersService, QueryUserService, UserRepository],
})
export class UsersModule {}
