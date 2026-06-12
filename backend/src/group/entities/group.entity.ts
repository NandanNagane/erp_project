import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  Unique,
} from 'typeorm';
import { CompanyEntity } from '../../company/entities/company.entity';

@Entity({ name: 'groups' })
@Unique('uq_groups_company_name', ['companyId', 'name'])
export class GroupEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Index('idx_groups_company_status')
  @Column({ name: 'company_id', type: 'bigint', unsigned: true })
  companyId: number;

  @ManyToOne(() => CompanyEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'company_id' })
  company: CompanyEntity;

  @Column({ type: 'varchar', length: 120 })
  name: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  description: string | null;

  @Column({ type: 'tinyint', default: 1 })
  status: number;

  @Index('idx_groups_is_system_group')
  @Column({
    name: 'is_system_group',
    type: 'tinyint',
    default: 0,
  })
  isSystemGroup: number;

  @Column({
    name: 'created_by',
    type: 'bigint',
    unsigned: true,
    nullable: true,
  })
  createdBy: number | null;

  @Column({
    name: 'updated_by',
    type: 'bigint',
    unsigned: true,
    nullable: true,
  })
  updatedBy: number | null;

  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'datetime' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'datetime', nullable: true })
  deletedAt: Date | null;
}
