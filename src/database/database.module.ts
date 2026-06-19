//src/database/database.module.ts
import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DatabaseService } from './database.service';
import { User } from 'src/modules/users/entities/user.entity';
import { Session } from 'src/modules/sessions/entities/session.entity';
import { Application } from 'src/modules/app-context/entities/application.entity';


const ENTITIES = [User, Session, Application];

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const isSSL = configService.get<string>('DB_SSL') === 'true';
        return {
          type: 'postgres',
          host: configService.get<string>('DB_HOST'),
          port: parseInt(configService.get<string>('DB_PORT') || '5432', 10),
          username: configService.get<string>('DB_USER'),
          password: configService.get<string>('DB_PASS'),
          database: configService.get<string>('DB_NAME'),
          schema: 'public',
          entities: ENTITIES,
          ssl: isSSL ? { rejectUnauthorized: false } : false,
        };
      },
    }),
  ],
  providers: [DatabaseService],
  exports: [DatabaseService, TypeOrmModule],
})
export class DatabaseModule {}
