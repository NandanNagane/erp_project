import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { GroupEntity } from '../entities/group.entity';
import { GeneralUtilities } from '../../packages/utilities/general.utility';

@Injectable()
export class GroupListService {
  constructor(
    @InjectRepository(GroupEntity)
    private readonly groupRepository: Repository<GroupEntity>,

    private readonly general: GeneralUtilities,
  ) {}

  async getAllGroupsForDropdown() {
    try {
      const list = await this.groupRepository.find({
        where: { status: 1 },
        select: { id: true, name: true, companyId: true },
        order: { name: 'ASC' },
      });
      return { success: 1, data: list };
    } catch (err: any) {
      return { success: 0, message: err.message };
    }
  }

  async startGroupDetails(params) {
    const response = await this.getGroupDetails(params);
    return response.success === 1
      ? this.finishSuccess(response)
      : this.finishFailure(response);
  }

  async getGroupDetails(params) {
    let return_data: any = {};
    try {
      if (!params.id) throw new Error('ID is required');

      const data = await this.groupRepository.findOne({
        where: { id: params.id },
      });
      if (!data) throw new Error('Group not found');

      return_data = {
        success: 1,
        message: 'Group details fetched successfully',
        data,
      };
    } catch (err: any) {
      return_data = { success: 0, message: err.message };
    }
    return return_data;
  }

  async startGroupList(params) {
    const response = await this.getGroupList(params);
    return response.success === 1
      ? this.finishSuccess(response)
      : this.finishFailure(response);
  }

  async getGroupList(params) {
    let return_data: any = {};
    try {
      const page = params.page ? parseInt(params.page) : 1;
      const limit = params.limit ? parseInt(params.limit) : 10;
      const skip = (page - 1) * limit;

      const queryBuilder = this.groupRepository.createQueryBuilder('group');

      if (params.filters) {
        this.general.applyDynamicFilters(queryBuilder, params.filters, 'group');
      }

      const sortBy = params.sort_by || 'id';
      const order = params.order?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

      queryBuilder.orderBy(`group.${sortBy}`, order);
      queryBuilder.skip(skip).take(limit);

      const [data, total] = await queryBuilder.getManyAndCount();

      return_data = {
        success: 1,
        message: 'Group list fetched successfully',
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
      return_data = { success: 0, message: err.message };
    }
    return return_data;
  }

  async finishSuccess(params) {
    return {
      settings: {
        success: params.success,
        message: params.message,
        data: params.data || [],
      },
    };
  }

  async finishFailure(params) {
    return params;
  }
}
