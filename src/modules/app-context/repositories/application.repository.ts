import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { ApplicationStatus } from 'src/common/enums/application-status.enum';
import { Application } from '../entities/application.entity';

@Injectable()
export class ApplicationRepository extends Repository<Application> {
  constructor(private readonly dataSource: DataSource) {
    super(Application, dataSource.createEntityManager());
  }

  async createApplication(data: Partial<Application>): Promise<Application> {
    const application = this.create(data);
    return this.save(application);
  }

  async findByAppId(appId: string): Promise<Application | null> {
    return this.findOne({ where: { appId } });
  }

  async findActiveByAppId(appId: string): Promise<Application | null> {
    return this.findOne({
      where: { appId, status: ApplicationStatus.ACTIVE },
    });
  }

  async findAllApplications(): Promise<Application[]> {
    return this.find({ order: { createdAt: 'DESC' } });
  }

  async updateApplication(
    appId: string,
    data: Partial<Application>,
  ): Promise<Application | null> {
    await this.update({ appId }, data);
    return this.findByAppId(appId);
  }
}
