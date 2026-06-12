import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';

import { UserEntity } from '../entities/user.entity';
import {
  ListFilterParams,
  PaginatedResult,
  TenantScope,
  normalisePagination,
} from '../../packages/interfaces/list-filter.interface';

/** Extended filters specific to user listings. */
export interface UserListFilters extends ListFilterParams {
  email?: string;
  username?: string;
  phone?: string;
  group?: string;
  company?: string;
}

@Injectable()
export class UsersRepository {
  constructor(
    @InjectRepository(UserEntity)
    private readonly repo: Repository<UserEntity>,
  ) {}

  // ───────────────────────── List / Find ─────────────────────────

  /**
   * Paginated, searchable, filterable user list.
   * Joins company, userGroups → group for listing display.
   * Company-scoped by default; SuperAdmin sees all.
   */
  async findAllByCompany(
    scope: TenantScope,
    filters: UserListFilters = {},
  ): Promise<PaginatedResult<UserEntity>> {
    const { page, limit, skip } = normalisePagination(filters);

    const qb = this.baseListQuery();

    if (!scope.isSuperAdmin) {
      qb.andWhere('user.company_id = :companyId', {
        companyId: scope.companyId,
      });
    }

    this.applyUserFilters(qb, filters);

    const sortBy = filters.sortBy || 'id';
    const order = filters.order || 'ASC';
    qb.orderBy(`user.${sortBy}`, order);

    qb.skip(skip).take(limit);

    const [data, total] = await qb.getManyAndCount();

    return {
      data,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  /**
   * Find a single user by PK + company scope.
   * Loads company, group assignment, and group details.
   */
  async findOneByIdAndCompany(
    id: number,
    scope: TenantScope,
  ): Promise<UserEntity | null> {
    const qb = this.baseDetailQuery().where('user.id = :id', { id });

    if (!scope.isSuperAdmin) {
      qb.andWhere('user.company_id = :companyId', {
        companyId: scope.companyId,
      });
    }

    return qb.getOne();
  }

  /** Find user by PK without company scoping (internal/system use). */
  async findOneById(id: number): Promise<UserEntity | null> {
    return this.repo.findOne({ where: { id } });
  }

  /**
   * Load full user detail with company, group, and the group's company.
   * Suitable for detail pages.
   */
  async findWithGroupAndCompany(
    id: number,
    scope: TenantScope,
  ): Promise<UserEntity | null> {
    const qb = this.repo
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.company', 'company')
      .leftJoinAndSelect('user.userGroups', 'ug')
      .leftJoinAndSelect('ug.group', 'grp')
      .leftJoinAndSelect('grp.company', 'grpCompany')
      .where('user.id = :id', { id });

    if (!scope.isSuperAdmin) {
      qb.andWhere('user.company_id = :companyId', {
        companyId: scope.companyId,
      });
    }

    return qb.getOne();
  }

  // ───────────────────────── Login / Auth lookups ─────────────────────────

  /** Find user by email – used for login. Not company-scoped. */
  async findOneByEmail(email: string): Promise<UserEntity | null> {
    return this.repo.findOne({
      where: { email },
      relations: { company: true },
    });
  }

  /** Find user by username – used for login. Not company-scoped. */
  async findOneByUsername(username: string): Promise<UserEntity | null> {
    return this.repo.findOne({
      where: { username },
      relations: { company: true },
    });
  }

  /**
   * Load full authorization context for an authenticated user:
   * user → company → userGroups → group → groupCapabilities → capability
   *
   * Used by auth guards and session hydration.
   */
  async findWithAuthContext(userId: number): Promise<UserEntity | null> {
    return this.repo
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.company', 'company')
      .leftJoinAndSelect('user.userGroups', 'ug')
      .leftJoinAndSelect('ug.group', 'grp')
      .leftJoin('group_capabilities', 'gc', 'gc.group_id = grp.id')
      .leftJoinAndMapMany(
        'grp.capabilities',
        'capabilities',
        'cap',
        'cap.id = gc.capability_id AND cap.status = 1',
      )
      .where('user.id = :userId', { userId })
      .getOne();
  }

  /**
   * Resolve all capability codes for a user.
   * Flattened string array suitable for guards.
   */
  async findCapabilityCodesForUser(userId: number): Promise<string[]> {
    const rows: Array<{ code: string }> = await this.repo
      .createQueryBuilder('user')
      .innerJoin('user_groups', 'ug', 'ug.user_id = user.id')
      .innerJoin('group_capabilities', 'gc', 'gc.group_id = ug.group_id')
      .innerJoin(
        'capabilities',
        'cap',
        'cap.id = gc.capability_id AND cap.status = 1',
      )
      .select('DISTINCT cap.code', 'code')
      .where('user.id = :userId', { userId })
      .getRawMany();

    return rows.map((r) => r.code);
  }

  // ───────────────────────── Existence checks ─────────────────────────

  async existsByEmail(email: string): Promise<boolean> {
    return this.repo.exists({ where: { email } });
  }

  async existsByUsername(username: string): Promise<boolean> {
    return this.repo.exists({ where: { username } });
  }

  // ───────────────────────── Mutations ─────────────────────────

  /** Create and persist a user.*/
  async createAndSave(data: Partial<UserEntity>): Promise<UserEntity> {
    const entity = this.repo.create({
      ...data,
    });
    return this.repo.save(entity);
  }

  /**
   * Update a user by id, scoped to the tenant.
   * Returns the updated entity or null if not found / out of scope.
   */
  async updateByIdAndCompany(
    id: number,
    scope: TenantScope,
    data: Partial<UserEntity>,
  ): Promise<UserEntity | null> {
    const existing = await this.findOneByIdAndCompany(id, scope);
    if (!existing) return null;

    Object.assign(existing, data, { updatedBy: scope.userId ?? null });
    return this.repo.save(existing);
  }

  /**
   * Soft-delete a user, scoped to tenant.
   * Returns true if a row was affected.
   */
  async softDeleteByIdAndCompany(
    id: number,
    scope: TenantScope,
  ): Promise<boolean> {
    const existing = await this.findOneByIdAndCompany(id, scope);
    if (!existing) return false;

    await this.repo.softDelete(id);
    return true;
  }

  /** Update last-access timestamp after successful login. */
  async updateLastAccessAt(userId: number): Promise<void> {
    await this.repo.update(userId, { lastAccessAt: new Date() });
  }

  // ───────────────────────── Private helpers ─────────────────────────

  /** Base query for list pages: includes company + group joins. */
  private baseListQuery(): SelectQueryBuilder<UserEntity> {
    return this.repo
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.company', 'company')
      .leftJoinAndSelect('user.userGroups', 'ug')
      .leftJoinAndSelect('ug.group', 'grp');
  }

  /** Base query for detail pages: same as list but can be extended. */
  private baseDetailQuery(): SelectQueryBuilder<UserEntity> {
    return this.baseListQuery();
  }

  /** Apply search and column-level filters to a user query builder. */
  private applyUserFilters(
    qb: SelectQueryBuilder<UserEntity>,
    filters: UserListFilters,
  ): void {
    if (filters.search) {
      qb.andWhere(
        '(user.name LIKE :search OR user.email LIKE :search OR user.username LIKE :search OR user.phone LIKE :search)',
        { search: `%${filters.search}%` },
      );
    }

    if (filters.status !== undefined) {
      qb.andWhere('user.status = :status', { status: filters.status });
    }

    if (filters.email) {
      qb.andWhere('user.email LIKE :email', {
        email: `%${filters.email}%`,
      });
    }

    if (filters.username) {
      qb.andWhere('user.username LIKE :username', {
        username: `%${filters.username}%`,
      });
    }

    if (filters.phone) {
      qb.andWhere('user.phone LIKE :phone', {
        phone: `%${filters.phone}%`,
      });
    }

    if (filters.group) {
      qb.andWhere('grp.name LIKE :group', {
        group: `%${filters.group}%`,
      });
    }

    if (filters.company) {
      qb.andWhere('company.name LIKE :company', {
        company: `%${filters.company}%`,
      });
    }
  }
}
