import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { UserRepository } from './repositories/user.repository';
import {
  UserProfileResponseDto,
  UserProfileDto,
} from './dtos/user-profile.dto';
import { UpdateUserDto, UpdateUserResponseDto } from './dtos/update-user.dto';
import { User } from './entities/user.entity';
import { UserStatus } from 'src/common/enums/user-status.enum';
import { HashUtil } from 'src/common/utils/hash.util';
import { ConfigService } from '@nestjs/config';
import { MESSAGES } from 'src/common/constants/messages.constants';

@Injectable()
export class UsersService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly configService: ConfigService,
  ) {}

  async getProfile(userId: string): Promise<UserProfileResponseDto> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new NotFoundException(MESSAGES.USER.NOT_FOUND);
    }
    const userProfile = this.mapToProfileDto(user);

    return {
      status: 200,
      message: MESSAGES.USER.USER_PROFILE_FOUND,
      data: userProfile,
    };
  }

  async updateProfile(
    userId: string,
    updateUserDto: UpdateUserDto,
  ): Promise<UpdateUserResponseDto> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new NotFoundException(MESSAGES.USER.NOT_FOUND);
    }

    const updateData: Partial<User> = {};

    if (updateUserDto.email) {
      const existingEmail = await this.userRepository.findByEmail(
        updateUserDto.email,
      );
      if (existingEmail && existingEmail.id !== userId) {
        throw new BadRequestException(MESSAGES.USER.ALREADY_EXISTS);
      }
      updateData.email = updateUserDto.email;
    }

    if (updateUserDto.username) {
      const existingUsername = await this.userRepository.findByUsername(
        updateUserDto.username,
      );
      if (existingUsername && existingUsername.id !== userId) {
        throw new BadRequestException(MESSAGES.USER.ALREADY_EXISTS);
      }
      updateData.username = updateUserDto.username;
    }

    if (updateUserDto.password) {
      const hashedPassword = await HashUtil.hashPassword(
        updateUserDto.password,
        parseInt(
          this.configService.get<string>('PASSWORD_HASH_ROUNDS') || '10',
          10,
        ),
      );
      updateData.password = hashedPassword;
    }

    const updatedUser = await this.userRepository.updateUser(
      userId,
      updateData,
    );

    if (!updatedUser) {
      throw new NotFoundException(MESSAGES.USER.NOT_FOUND);
    }

    const profileUpdate = this.mapToProfileDto(updatedUser);
    return {
      status: 200,
      message: MESSAGES.USER.PROFILE_UPDATED,
      data: profileUpdate,
    };
  }

  async deactivateAccount(userId: string): Promise<{ message: string }> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new NotFoundException(MESSAGES.USER.NOT_FOUND);
    }

    await this.userRepository.updateUser(userId, {
      status: UserStatus.DEACTIVATED,
    });

    return { message: 'Account deactivated successfully' };
  }

  private mapToProfileDto(user: User): UserProfileDto {
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      status: user.status,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
