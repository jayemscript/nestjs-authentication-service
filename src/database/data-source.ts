//src/database/data-source.ts

import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { User } from 'src/modules/users/entities/user.entity';
import { Session } from 'src/modules/sessions/entities/session.entity';
import { Application } from 'src/modules/app-context/entities/application.entity';


config();

const ENTITIES = [User, Session, Application];

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  schema: 'public',
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  entities: ENTITIES,
  migrations: ['src/migrations/*.{ts,js}'],
});
