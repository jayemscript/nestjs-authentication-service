import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppContextController } from './app-context.controller';
import { AppContextService } from './app-context.service';
import { Application } from './entities/application.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Application])],
  controllers: [AppContextController],
  providers: [AppContextService],
  exports: [AppContextService, TypeOrmModule],
})
export class AppContextModule {}
