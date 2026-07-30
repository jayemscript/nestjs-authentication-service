import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entities';
import { PaginationService } from '../../../common/services/pagination.service';
import {
  UserProfileDto,
  UserProfileResponseDto,
} from '../dtos/user-profile.dto';
import { MESSAGES } from 'src/common/constants/messages.constants';

@Injectable()
export class QueryUserService {
  constructor(
    private readonly paginationService: PaginationService<User>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async getAccountProfile(userId: string): Promise<UserProfileResponseDto> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: {
        sessions: true,
        userApplications: true,
      },
    });

    if (!user) {
      throw new NotFoundException(MESSAGES.USER.NOT_FOUND);
    }

    return {
      status: 200,
      message: MESSAGES.USER.USER_PROFILE_FOUND,
      data: this.mapToProfileDto(user),
    };
  }

  async getAllUsers(
    page?: number,
    limit?: number,
    keyword?: string,
    sortBy?: string,
    sortOrder?: 'asc' | 'desc',
    filters?: string | Record<string, any> | Record<string, any>[],
  ) {
    let parsedFilters: Record<string, any> | Record<string, any>[] = {};
    if (filters) {
      if (typeof filters === 'string') {
        try {
          parsedFilters = JSON.parse(filters);
        } catch (err: unknown) {
          throw new BadRequestException(
            `Invalid JSON or Invalid variable type in 'filters': ${(err as Error).message}`,
          );
        }
      } else {
        parsedFilters = filters;
      }
    }

    const result = await this.paginationService.paginate(
      this.userRepository,
      'user',
      {
        page: page || 1,
        limit: limit || 10,
        keyword: keyword || '',
        searchableFields: ['id', 'username', 'email'],
        sortableFields: ['username', 'email'],
        sortBy: (sortBy?.trim() as keyof User) || 'createdAt',
        sortOrder: sortOrder || 'desc',
        dataKey: 'users_data',
        relations: ['sessions', 'userApplications'],
        filters: parsedFilters,
        withDeleted: true,
      },
    );

    return {
      ...result,
      users_data: result.users_data.map((user: User) =>
        this.mapToProfileDto(user),
      ),
    };
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
      sessions: user.sessions,
      userApplications: user.userApplications,
    };
  }
}
