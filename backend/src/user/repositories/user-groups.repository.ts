import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { UserGroupEntity } from '../entities/user-group.entity';
import { GroupEntity } from '../../group/entities/group.entity';

@Injectable()
export class UserGroupsRepository {
  constructor(
    @InjectRepository(UserGroupEntity)
    private readonly repo: Repository<UserGroupEntity>,
  ) {}

  /**
   * Get the assigned group for a given user.
   * Returns the GroupEntity if assigned, null otherwise.
   */
  async findGroupForUser(userId: number): Promise<GroupEntity | null> {
    const userGroup = await this.repo.findOne({
      where: { userId },
      relations: { group: true },
    });
    
    return userGroup ? userGroup.group : null;
  }

  /**
   * Assign a group to a user (V1 allows only 1 group per user).
   * Note: Assumes UNIQUE(user_id) constraint exists.
   */
  async assignGroupToUser(
    userId: number,
    groupId: number,
    assignedBy?: number,
  ): Promise<UserGroupEntity> {
    const entity = this.repo.create({
      userId,
      groupId,
      assignedBy: assignedBy ?? null,
    });
    
    return this.repo.save(entity);
  }

  /**
   * Replaces the user's group by removing any existing assignments and adding the new one.
   * Useful when updating a user's role.
   */
  async replaceUserGroup(
    userId: number,
    groupId: number,
    assignedBy?: number,
  ): Promise<UserGroupEntity> {
    // We can run this in a transaction or rely on save() to overwrite if PK handles it.
    // However, user_groups has composite PK (user_id, group_id). 
    // Since V1 dictates 1 user -> 1 group, we first delete any existing group for the user.
    await this.repo.delete({ userId });

    return this.assignGroupToUser(userId, groupId, assignedBy);
  }

  /**
   * Remove a user from all groups.
   */
  async clearUserGroups(userId: number): Promise<void> {
    await this.repo.delete({ userId });
  }
}
