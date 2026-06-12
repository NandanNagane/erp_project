import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { GroupCapabilityEntity } from '../entities/group-capability.entity';
import { CapabilityEntity } from '../entities/capability.entity';

@Injectable()
export class GroupCapabilitiesRepository {
  constructor(
    @InjectRepository(GroupCapabilityEntity)
    private readonly repo: Repository<GroupCapabilityEntity>,
  ) {}

  /**
   * Fetch all capabilities assigned to a specific group.
   * Includes the full CapabilityEntity detail.
   */
  async findCapabilitiesForGroup(groupId: number): Promise<CapabilityEntity[]> {
    const results = await this.repo.find({
      where: { groupId },
      relations: { capability: true },
    });
    
    return results.map((gc) => gc.capability);
  }

  /**
   * Replace all capabilities for a group in bulk.
   * Removes existing capabilities and inserts the new ones.
   */
  async replaceGroupCapabilities(
    groupId: number,
    capabilityIds: number[],
    createdBy?: number,
  ): Promise<void> {
    // Remove existing capabilities
    await this.repo.delete({ groupId });

    if (capabilityIds.length === 0) {
      return; // Nothing to add
    }

    // Insert new capabilities
    const entities = capabilityIds.map((capabilityId) => 
      this.repo.create({
        groupId,
        capabilityId,
        createdBy: createdBy ?? null,
      })
    );

    // save() handles bulk inserts when given an array
    await this.repo.save(entities);
  }

  /**
   * Check whether a group has a specific capability code.
   */
  async hasCapabilityCode(groupId: number, capabilityCode: string): Promise<boolean> {
    const count = await this.repo
      .createQueryBuilder('gc')
      .innerJoin('gc.capability', 'cap')
      .where('gc.group_id = :groupId', { groupId })
      .andWhere('cap.code = :code', { code: capabilityCode })
      .andWhere('cap.status = 1')
      .getCount();
      
    return count > 0;
  }
}
