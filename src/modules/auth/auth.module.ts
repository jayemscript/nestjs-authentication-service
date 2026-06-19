import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { JwtModule } from '../jwt.module';
import { SessionsModule } from '../sessions/sessions.module';
import { AppContextModule } from '../app-context/app-context.module';

@Module({
  imports: [JwtModule, UsersModule, SessionsModule, AppContextModule],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
