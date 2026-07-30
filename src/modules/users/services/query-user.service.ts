import { BadRequestException, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entities';
import { PaginationService } from '../../../common/services/pagination.service';

@Injectable()
export class QueryUserService {
  constructor(
    private readonly paginationService: PaginationService<User>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

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

    return this.paginationService.paginate(this.userRepository, 'user', {
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
    });
  }
}
