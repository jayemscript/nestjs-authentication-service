import {
  Controller,
  Get,
  Put,
  Post,
  Body,
  UseGuards,
  Delete,
  Req,
  Query,
  Param,
} from '@nestjs/common';
import { UsersService, QueryUserService } from './services';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { UpdateUserDto, UpdateUserResponseDto } from './dtos/update-user.dto';
import {
  UserProfileResponseDto,
  UserProfileDto,
} from './dtos/user-profile.dto';
import { Private } from 'src/common/decorators/private.decorator';
import { User } from './entities/user.entity';

@Controller('users')
@UseGuards(AuthGuard)
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly queryUserService: QueryUserService,
  ) {}

  @Private()
  @Get('profile')
  async getProfile(@CurrentUser() user: User): Promise<UserProfileResponseDto> {
    return this.queryUserService.getAccountProfile(user.id);
  }

  @Private()
  @Put('profile-update')
  async updateProfile(
    @CurrentUser() user: User,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UpdateUserResponseDto> {
    return this.usersService.updateProfile(user.id, updateUserDto);
  }

  @Private()
  @Delete('deactivate')
  async deactivateAccount(
    @CurrentUser() user: User,
  ): Promise<{ message: string }> {
    return this.usersService.deactivateAccount(user.id);
  }

  @Put('admin/:userId')
  async adminUpdateUser(
    @Param('userId') userId: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UpdateUserResponseDto> {
    return this.usersService.updateProfile(userId, updateUserDto);
  }

  @Delete('admin/:userId')
  async adminDeactivateUser(
    @Param('userId') userId: string,
  ): Promise<{ message: string }> {
    return this.usersService.deactivateAccount(userId);
  }

  @Get('all')
  async getAllUsers(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('keyword') keyword?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
    @Query('filters') filters?: string,
  ) {
    const result = await this.queryUserService.getAllUsers(
      page ? parseInt(page, 10) : undefined,
      limit ? parseInt(limit, 10) : undefined,
      keyword,
      sortBy,
      sortOrder,
      filters,
    );
    return result;
  }
}
