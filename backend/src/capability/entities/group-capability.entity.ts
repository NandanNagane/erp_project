import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  PrimaryColumn,
  Index,
} from 'typeorm';
import { GroupEntity } from '../../group/entities/group.entity';
import { CapabilityEntity } from './capability.entity';

@Entity({ name: 'group_capabilities' })
export class GroupCapabilityEntity {
  @PrimaryColumn({ name: 'group_id', type: 'bigint', unsigned: true })
  groupId: number;

  @PrimaryColumn({ name: 'capability_id', type: 'bigint', unsigned: true })
  capabilityId: number;

  @ManyToOne(() => GroupEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'group_id' })
  group: GroupEntity;

  @Index('idx_group_capabilities_capability')
  @ManyToOne(() => CapabilityEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'capability_id' })
  capability: CapabilityEntity;

  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  createdAt: Date;

  @Column({
    name: 'created_by',
    type: 'bigint',
    unsigned: true,
    nullable: true,
  })
  createdBy: number | null;
}
