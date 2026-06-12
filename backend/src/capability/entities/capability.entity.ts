import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  Unique,
} from 'typeorm';

@Entity({ name: 'capabilities' })
@Unique('uq_capabilities_module_action', ['module', 'action'])
export class CapabilityEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ type: 'varchar', length: 150, unique: true })
  code: string;

  @Index('idx_capabilities_module')
  @Column({ type: 'varchar', length: 100 })
  module: string;

  @Index('idx_capabilities_action')
  @Column({ type: 'varchar', length: 50 })
  action: string;

  @Column({ name: 'display_name', type: 'varchar', length: 150 })
  displayName: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  description: string | null;

  @Column({ type: 'tinyint', default: 1 })
  status: number;

  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'datetime' })
  updatedAt: Date;
}
