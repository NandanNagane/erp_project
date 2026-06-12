import { Injectable } from '@nestjs/common';
import { UserEntity } from '../entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GeneralUtilities } from 'src/packages/utilities/general.utility';

@Injectable()
export class UserDetailsService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly general: GeneralUtilities,
  ) {}

  async startUserDetails(params) {
    if (!params.id && !params.email) {
      return { success: 0, message: 'ID or Email is required' };
    }
    const response = await this.getUserDetails(params);
    if (response.success === 1) {
      return this.general.finishSuccess(response);
    }
    return this.general.finishFailure(response);
  }

  async getUserDetails(params) {
    let return_data: any = {};
    try {
      const queryBuilder = this.userRepository.createQueryBuilder('user');

      queryBuilder.leftJoinAndSelect('user.company', 'company');

      // Join user_groups → group
      queryBuilder
        .leftJoinAndSelect('user.userGroups', 'userGroup')
        .leftJoinAndSelect('userGroup.group', 'group');

      if (params.id) {
        queryBuilder.andWhere('user.id = :id', { id: params.id });
      }
      if (params.email) {
        queryBuilder.andWhere('user.email = :email', { email: params.email });
      }

      const data = await queryBuilder.getOne();
      if (!data) throw new Error('User not found');

      return_data = {
        success: 1,
        message: 'User details fetched successfully',
        data,
      };
    } catch (err: any) {
      return_data = { success: 0, message: err.message };
    }
    return return_data;
  }
}
