import { Injectable } from '@nestjs/common';
import { UserEntity } from '../entities/user.entity';
import { UsersRepository } from '../repositories/users.repository';

@Injectable()
export class UserService {
  constructor(private readonly usersRepo: UsersRepository) {}

  async findOne(username: string): Promise<UserEntity | undefined> {
    const user = await this.usersRepo.findOneByUsername(username);
    return user || undefined;
  }

  async findById(id: number): Promise<UserEntity | undefined> {
    const user = await this.usersRepo.findOneById(id);
    return user || undefined;
  }
}
