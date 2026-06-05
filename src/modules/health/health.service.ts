import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class HealthService {
  constructor(private readonly databaseService: DatabaseService) {}

  async checkHealth() {
    try {
      const dataSource = this.databaseService.getDataSource();
      await dataSource.query('SELECT NOW()');

      return {
        status: 'ok',
        timestamp: new Date(),
        database: 'connected',
      };
    } catch (error: unknown) {
      let message = 'Unknown error occurred';

      if (error instanceof Error) {
        message = error.message;
      } else if (typeof error === 'string') {
        message = error;
      }

      return {
        status: 'error',
        timestamp: new Date(),
        database: 'disconnected',
        message,
      };
    }
  }
}
