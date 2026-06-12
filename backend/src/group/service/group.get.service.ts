import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GroupEntity } from '../entities/group.entity';

@Injectable()
export class GroupGetService {
  constructor(
    @InjectRepository(GroupEntity)
    private readonly groupRepository: Repository<GroupEntity>,
  ) {}

  async startGroupGet(id: number) {
    const group = await this.groupRepository.findOne({
      where: { id },
    });

    if (!group) {
      return {
        statusCode: 404,
        message: 'Group not found',
      };
    }

    return {
      statusCode: 200,
      data: group,
    };
  }
}
