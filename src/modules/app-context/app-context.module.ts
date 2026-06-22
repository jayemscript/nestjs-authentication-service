import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppContextController } from './app-context.controller';
import { AppContextService } from './app-context.service';
import { Application } from './entities/application.entity';
import { ApplicationRepository } from './repositories/application.repository';
import { SessionsModule } from '../sessions/sessions.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Application]),
    forwardRef(() => SessionsModule),
  ],
  controllers: [AppContextController],
  providers: [AppContextService, ApplicationRepository],
  exports: [AppContextService, TypeOrmModule],
})
export class AppContextModule {}
