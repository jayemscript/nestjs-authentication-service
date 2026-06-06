import {
  Controller,
  Get,
  Put,
  Post,
  Body,
  UseGuards,
  Delete,
} from '@nestjs/common';
import { UsersService } from './users.service';
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
  constructor(private readonly usersService: UsersService) {}

  @Private()
  @Get('profile')
  async getProfile(@CurrentUser() user: User): Promise<UserProfileResponseDto> {
    return this.usersService.getProfile(user.id);
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
}
