import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { GroupEntity } from '../entities/group.entity';

@Injectable()
export class GroupService {
  constructor(
    @InjectRepository(GroupEntity)
    private readonly groupRepository: Repository<GroupEntity>,
  ) {}

  async startGroupInsert(body) {
    const response = await this.insertGroup(body);

    if (response.success === 1) {
      return this.finishSuccess(response);
    }

    return this.finishFailure(response);
  }

  async insertGroup(body) {
    let return_data: any = {};

    try {
      if (!body.name) {
        throw new Error('name is required');
      }

      if (!body.companyId) {
        throw new Error('companyId is required');
      }

      const group = this.groupRepository.create({
        name: body.name,
        companyId: body.companyId,
        description: body.description || null,
        isSystemGroup: body.isSystemGroup || 0,
      });

      const savedGroup = await this.groupRepository.save(group);

      return_data = {
        success: 1,
        message: 'Group created successfully',
        data: savedGroup,
      };
    } catch (err: any) {
      return_data = {
        success: 0,
        message: err.message,
      };
    }

    return return_data;
  }

  async startGroupUpdate(body) {
    const response = await this.updateGroup(body);

    if (response.success === 1) {
      return this.finishSuccess(response);
    }

    return this.finishFailure(response);
  }

  async updateGroup(body) {
    let return_data: any = {};

    try {
      const { id, ...updateData } = body;

      const existingGroup = await this.groupRepository.findOne({
        where: { id },
      });

      if (!existingGroup) {
        throw new Error('Group not found');
      }

      await this.groupRepository.update(id, updateData);

      const updatedGroup = await this.groupRepository.findOne({
        where: { id },
      });

      return_data = {
        success: 1,
        message: 'Group updated successfully',
        data: updatedGroup,
      };
    } catch (err: any) {
      return_data = {
        success: 0,
        message: err.message,
      };
    }

    return return_data;
  }

  async startGroupDelete(id: number) {
    const response = await this.deleteGroup(id);

    if (response.success === 1) {
      return this.finishSuccess(response);
    }

    return this.finishFailure(response);
  }

  async deleteGroup(id: number) {
    let return_data: any = {};

    try {
      const existingGroup = await this.groupRepository.findOne({
        where: { id },
      });

      if (!existingGroup) {
        throw new Error('Group not found');
      }

      // Protect system groups from deletion
      if (existingGroup.isSystemGroup === 1) {
        throw new Error('System groups cannot be deleted');
      }

      // Soft delete (uses @DeleteDateColumn)
      await this.groupRepository.softDelete(id);

      return_data = {
        success: 1,
        message: 'Group deleted successfully',
      };
    } catch (err: any) {
      return_data = {
        success: 0,
        message: err.message,
      };
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
