import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { CompanyEntity } from '../../company/entities/company.entity';
import { UserGroupEntity } from './user-group.entity';
import { Exclude } from 'class-transformer';
import { Role } from 'src/packages/role.enum';

@Entity({ name: 'users' })
@Index('idx_users_company_status', ['companyId', 'status'])
export class UserEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ name: 'company_id', type: 'bigint', unsigned: true })
  companyId: number;

  @ManyToOne(() => CompanyEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'company_id' })
  company: CompanyEntity;

  @Column({ type: 'varchar', length: 150 })
  name: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  username: string;

  @Column({ type: 'varchar', length: 30, nullable: true })
  phone: string | null;

  @Column({ name: 'password_hash', type: 'varchar', length: 255 })
  @Exclude()
  passwordHash: string;

  @Column({ type: 'tinyint', default: 1 })
  status: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  profImg: string | null;

  @Index('idx_users_is_super_admin')
  @Column({
    name: 'is_super_admin',
    type: 'tinyint',
    default: 0,
  })
  isSuperAdmin: number;

  @Index('idx_users_role')
  @Column({
    name: 'role',
    type: 'enum',
    default: Role.COMPANY_EMPLOYEE,
    enum: Role,
  })
  role: Role;


  @Column({ type: 'date', nullable: true })
  dob: Date | null;

  @Column({ name: 'last_access_at', type: 'datetime', nullable: true })
  lastAccessAt: Date | null;

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

  @OneToMany(() => UserGroupEntity, (userGroup) => userGroup.user)
  userGroups: UserGroupEntity[];
}
