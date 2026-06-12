import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  PrimaryColumn,
  Index,
  Unique,
} from 'typeorm';
import { UserEntity } from './user.entity';
import { GroupEntity } from '../../group/entities/group.entity';

@Entity({ name: 'user_groups' })
@Unique('uq_user_groups_user', ['userId'])
export class UserGroupEntity {
  @PrimaryColumn({ name: 'user_id', type: 'bigint', unsigned: true })
  userId: number;

  @PrimaryColumn({ name: 'group_id', type: 'bigint', unsigned: true })
  groupId: number;

  @ManyToOne(() => UserEntity, (user) => user.userGroups, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @Index('idx_user_groups_group')
  @ManyToOne(() => GroupEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'group_id' })
  group: GroupEntity;

  @CreateDateColumn({ name: 'assigned_at', type: 'datetime' })
  assignedAt: Date;

  @Column({
    name: 'assigned_by',
    type: 'bigint',
    unsigned: true,
    nullable: true,
  })
  assignedBy: number | null;
}
