import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { UserEntity } from '../entities/user.entity';
import { GeneralUtilities } from '../../packages/utilities/general.utility';

@Injectable()
export class UserListService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,

    private readonly general: GeneralUtilities,
  ) {}

  async startUserList(params: any) {
    const response = await this.getUserList(params);
    return response;
  }

  async getUserList(params: any) {
    try {
      const page = params.page ? parseInt(params.page) : 1;
      const limit = params.limit ? parseInt(params.limit) : 10;
      const skip = (page - 1) * limit;

      const queryBuilder = this.userRepository.createQueryBuilder('user');

      // Join company directly (user now has companyId FK)
      queryBuilder.leftJoinAndSelect('user.company', 'company');

      // Join user_groups → group
      queryBuilder
        .leftJoinAndSelect('user.userGroups', 'userGroup')
        .leftJoinAndSelect('userGroup.group', 'group');

      if (params.search) {
        queryBuilder.andWhere(
          `(user.name LIKE :search OR user.email LIKE :search OR user.phone LIKE :search OR user.username LIKE :search)`,
          { search: `%${params.search}%` },
        );
      }

      if (params.email) {
        queryBuilder.andWhere('user.email LIKE :email', {
          email: `%${params.email}%`,
        });
      }

      if (params.phone) {
        queryBuilder.andWhere('user.phone LIKE :phone', {
          phone: `%${params.phone}%`,
        });
      }

      if (params.username) {
        queryBuilder.andWhere('user.username LIKE :username', {
          username: `%${params.username}%`,
        });
      }

      if (params.status) {
        queryBuilder.andWhere('user.status = :status', {
          status: params.status,
        });
      }

      if (params.group) {
        queryBuilder.andWhere('group.name LIKE :group', {
          group: `%${params.group}%`,
        });
      }

      if (params.company) {
        queryBuilder.andWhere('company.name LIKE :company', {
          company: `%${params.company}%`,
        });
      }

      const allowedSortFields = [
        'id',
        'name',
        'email',
        'phone',
        'status',
        'createdAt',
      ];
      const sortBy = allowedSortFields.includes(params.sort_by)
        ? params.sort_by
        : 'id';
      const order = params.order?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
      queryBuilder.orderBy(`user.${sortBy}`, order);

      queryBuilder.skip(skip).take(limit);

      const [data, total] = await queryBuilder.getManyAndCount();

      return {
        success: 1,
        message: 'User list fetched successfully',
        data: {
          list: data,
          pagination: {
            total,
            page,
            limit,
            total_pages: Math.ceil(total / limit),
          },
        },
      };
    } catch (err: any) {
      return { success: 0, message: err.message };
    }
  }

  async startGetAllUsers(params: any) {
    const response = await this.getUserList(params);
    if (response.success === 1) {
      return this.general.finishSuccess(response);
    }
    return this.general.finishFailure(response);
  }

  async getAllUsers() {
    let return_data: any = {};

    try {
      const res = await this.userRepository.find();

      return_data = {
        success: 1,
        message: 'Data Fetched SuccessFully',
        data: res,
      };
      return return_data;
    } catch (err: any) {
      return_data = {
        success: 0,
        message: err.message,
      };
      return return_data;
    }
  }
}
