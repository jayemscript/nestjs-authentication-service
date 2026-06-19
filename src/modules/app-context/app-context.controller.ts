import {
  Body,
  Controller,
  Get,
  Delete,
  Patch,
  Post,
  Param,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { AppIdGuard } from 'src/common/guards/app-id.guard';
import { Private } from 'src/common/decorators/private.decorator';
import { AppContextService } from './app-context.service';
import { ApplicationDto } from './dtos/application.dto';
import { CreateApplicationDto } from './dtos/create-application.dto';
import { UpdateApplicationDto } from './dtos/update-application.dto';

@Controller('app-context')
@Private()
@UseGuards(AppIdGuard, AuthGuard)
export class AppContextController {
  constructor(private readonly appContextService: AppContextService) {}

  @Post()
  async createApplication(
    @Body() createApplicationDto: CreateApplicationDto,
  ): Promise<ApplicationDto> {
    return this.appContextService.createApplication(createApplicationDto);
  }

  @Get()
  async getApplications(): Promise<ApplicationDto[]> {
    return this.appContextService.getApplications();
  }

  @Get(':appId')
  async getApplication(
    @Param('appId') appId: string,
  ): Promise<ApplicationDto> {
    return this.appContextService.getApplication(appId);
  }

  @Patch(':appId')
  async updateApplication(
    @Param('appId') appId: string,
    @Body() updateApplicationDto: UpdateApplicationDto,
  ): Promise<ApplicationDto> {
    return this.appContextService.updateApplication(appId, updateApplicationDto);
  }

  @Delete(':appId')
  async disableApplication(
    @Param('appId') appId: string,
  ): Promise<{ message: string }> {
    return this.appContextService.disableApplication(appId);
  }
}
