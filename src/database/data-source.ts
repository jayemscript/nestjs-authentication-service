//src/database/data-source.ts

import { DataSource } from 'typeorm';
import { config } from 'dotenv';

config();

const ENTITIES = [];

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
  migrations: [__dirname + '/../../migrations/*.{ts,js}'],
});
