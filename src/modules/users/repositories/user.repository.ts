import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { User } from '../entities/user.entity';

@Injectable()
export class UserRepository extends Repository<User> {
  constructor(private readonly dataSource: DataSource) {
    super(User, dataSource.createEntityManager());
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.findOne({ where: { email } });
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.findOne({ where: { username } });
  }

  async findByIdentifier(identifier: string): Promise<User | null> {
    return this.createQueryBuilder('user')
      .where(
        'user.email = :identifier OR user.username = :identifier',
        {
          identifier,
        },
      )
      .getOne();
  }

  async findById(id: string): Promise<User | null> {
    return this.findOne({ where: { id } });
  }

  async createUser(data: Partial<User>): Promise<User> {
    const user = this.create(data);
    return this.save(user);
  }

  async updateUser(id: string, data: Partial<User>): Promise<User | null> {
    await this.update(id, data);
    return this.findById(id);
  }

  async deleteUser(id: string): Promise<boolean> {
    const result = await this.delete(id);
    return result.affected! > 0;
  }
}
