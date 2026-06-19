import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { APP_CONTEXT_CONSTANTS } from 'src/common/constants/app-context.constants';
import { MESSAGES } from 'src/common/constants/messages.constants';
import { ApplicationStatus } from 'src/common/enums/application-status.enum';
import { ApplicationContext } from 'src/common/types/application-context.types';
import { CreateApplicationDto } from './dtos/create-application.dto';
import { UpdateApplicationDto } from './dtos/update-application.dto';
import { ApplicationDto } from './dtos/application.dto';
import { AppContextDto } from './dtos/app-context.dto';
import { Application } from './entities/application.entity';
import { ApplicationRepository } from './repositories/application.repository';

@Injectable()
export class AppContextService {
  constructor(private readonly applicationRepository: ApplicationRepository) {}

  async createApplication(
    createApplicationDto: CreateApplicationDto,
  ): Promise<ApplicationDto> {
    const existingApplication = await this.applicationRepository.findByAppId(
      createApplicationDto.appId,
    );

    if (existingApplication) {
      throw new ConflictException(MESSAGES.APP_CONTEXT.ALREADY_EXISTS);
    }

    const application = await this.applicationRepository.createApplication({
      ...createApplicationDto,
      status: createApplicationDto.status ?? ApplicationStatus.ACTIVE,
    });

    return this.mapToApplicationDto(application);
  }

  async getApplications(): Promise<ApplicationDto[]> {
    const applications =
      await this.applicationRepository.findAllApplications();

    return applications.map((application) =>
      this.mapToApplicationDto(application),
    );
  }

  async getApplication(appId: string): Promise<ApplicationDto> {
    const application = await this.findApplicationOrThrow(appId);
    return this.mapToApplicationDto(application);
  }

  async updateApplication(
    appId: string,
    updateApplicationDto: UpdateApplicationDto,
  ): Promise<ApplicationDto> {
    await this.findApplicationOrThrow(appId);

    const application = await this.applicationRepository.updateApplication(
      appId,
      updateApplicationDto,
    );

    if (!application) {
      throw new NotFoundException(MESSAGES.APP_CONTEXT.NOT_FOUND);
    }

    return this.mapToApplicationDto(application);
  }

  async disableApplication(appId: string): Promise<{ message: string }> {
    await this.findApplicationOrThrow(appId);

    await this.applicationRepository.updateApplication(appId, {
      status: ApplicationStatus.DISABLED,
    });

    return { message: MESSAGES.APP_CONTEXT.DISABLED };
  }

  async resolveApplicationContext(appId?: string): Promise<AppContextDto> {
    const resolvedAppId = appId || APP_CONTEXT_CONSTANTS.DEFAULT_APP_ID;
    const application =
      await this.applicationRepository.findActiveByAppId(resolvedAppId);

    if (!application) {
      throw new ForbiddenException(MESSAGES.APP_CONTEXT.INVALID);
    }

    return this.mapToAppContextDto(application);
  }

  async validateUserAccess(
    userId: string,
    appId?: string,
  ): Promise<ApplicationContext> {
    const applicationContext = await this.resolveApplicationContext(appId);

    // MVP: any active user can access any active application.
    // A user-app permission table can plug in here later.
    if (!userId) {
      throw new ForbiddenException(MESSAGES.ERROR.FORBIDDEN);
    }

    return applicationContext;
  }

  private async findApplicationOrThrow(appId: string): Promise<Application> {
    const application = await this.applicationRepository.findByAppId(appId);

    if (!application) {
      throw new NotFoundException(MESSAGES.APP_CONTEXT.NOT_FOUND);
    }

    return application;
  }

  private mapToApplicationDto(application: Application): ApplicationDto {
    return {
      id: application.id,
      appId: application.appId,
      name: application.name,
      description: application.description,
      status: application.status,
      refreshTokenExpirationSeconds:
        application.refreshTokenExpirationSeconds,
      maxSessionsPerUser: application.maxSessionsPerUser,
      strictIpValidation: application.strictIpValidation,
      createdAt: application.createdAt,
      updatedAt: application.updatedAt,
    };
  }

  private mapToAppContextDto(application: Application): AppContextDto {
    return {
      appId: application.appId,
      name: application.name,
      status: application.status,
      refreshTokenExpirationSeconds:
        application.refreshTokenExpirationSeconds,
      maxSessionsPerUser: application.maxSessionsPerUser,
      strictIpValidation: application.strictIpValidation,
    };
  }
}
