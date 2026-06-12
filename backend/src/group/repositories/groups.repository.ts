import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';

import { GroupEntity } from '../entities/group.entity';
import {
  ListFilterParams,
  PaginatedResult,
  TenantScope,
  normalisePagination,
} from '../../packages/interfaces/list-filter.interface';

@Injectable()
export class GroupsRepository {
  constructor(
    @InjectRepository(GroupEntity)
    private readonly repo: Repository<GroupEntity>,
  ) {}

  // ───────────────────────── List / Find ─────────────────────────

  /**
   * Paginated, filterable list of groups for a specific company.
   * SuperAdmins see all groups across all companies.
   */
  async findAllByCompany(
    scope: TenantScope,
    filters: ListFilterParams = {},
  ): Promise<PaginatedResult<GroupEntity>> {
    const { page, limit, skip } = normalisePagination(filters);

    const qb = this.repo.createQueryBuilder('group');

    // Tenant scoping
    if (!scope.isSuperAdmin) {
      qb.andWhere('group.company_id = :companyId', {
        companyId: scope.companyId,
      });
    }

    this.applyCommonFilters(qb, filters);

    const sortBy = filters.sortBy || 'id';
    const order = filters.order || 'ASC';
    qb.orderBy(`group.${sortBy}`, order);

    qb.skip(skip).take(limit);

    const [data, total] = await qb.getManyAndCount();

    return {
      data,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  /**
   * Find a single group by PK, scoped to the tenant.
   * SuperAdmin bypasses the scope.
   */
  async findOneByIdAndCompany(
    id: number,
    scope: TenantScope,
  ): Promise<GroupEntity | null> {
    const qb = this.repo
      .createQueryBuilder('group')
      .where('group.id = :id', { id });

    if (!scope.isSuperAdmin) {
      qb.andWhere('group.company_id = :companyId', {
        companyId: scope.companyId,
      });
    }

    return qb.getOne();
  }

  /**
   * Find a group by ID without tenant scope.
   * Useful for internal/system processes.
   */
  async findOneById(id: number): Promise<GroupEntity | null> {
    return this.repo.findOne({ where: { id } });
  }

  /** Get all active groups for dropdowns. */
  async findAllActiveForDropdown(scope: TenantScope): Promise<GroupEntity[]> {
    const qb = this.repo
      .createQueryBuilder('group')
      .select(['group.id', 'group.name', 'group.companyId'])
      .where('group.status = 1');

    if (!scope.isSuperAdmin) {
      qb.andWhere('group.company_id = :companyId', {
        companyId: scope.companyId,
      });
    }

    qb.orderBy('group.name', 'ASC');

    return qb.getMany();
  }

  // ───────────────────────── Mutations ─────────────────────────

  /** Create and persist a new group. Generates UUID automatically. */
  async createAndSave(data: Partial<GroupEntity>): Promise<GroupEntity> {
    const entity = this.repo.create({
      ...data,
    });
    return this.repo.save(entity);
  }

  /**
   * Update a group by ID, scoped to the tenant.
   * Returns updated entity or null if not found.
   */
  async updateByIdAndCompany(
    id: number,
    scope: TenantScope,
    data: Partial<GroupEntity>,
  ): Promise<GroupEntity | null> {
    const existing = await this.findOneByIdAndCompany(id, scope);
    if (!existing) return null;

    Object.assign(existing, data, { updatedBy: scope.userId ?? null });
    return this.repo.save(existing);
  }

  /**
   * Soft-delete a group, scoped to the tenant.
   * Returns true if affected.
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

  // ───────────────────────── Private helpers ─────────────────────────

  private applyCommonFilters(
    qb: SelectQueryBuilder<GroupEntity>,
    filters: ListFilterParams,
  ): void {
    if (filters.search) {
      qb.andWhere(
        '(group.name LIKE :search OR group.description LIKE :search)',
        { search: `%${filters.search}%` },
      );
    }

    if (filters.status !== undefined) {
      qb.andWhere('group.status = :status', { status: filters.status });
    }
  }
}
