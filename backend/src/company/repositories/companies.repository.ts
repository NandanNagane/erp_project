import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';

import { CompanyEntity } from '../entities/company.entity';
import {
  ListFilterParams,
  PaginatedResult,
  TenantScope,
  normalisePagination,
} from '../../packages/interfaces/list-filter.interface';

@Injectable()
export class CompaniesRepository {
  constructor(
    @InjectRepository(CompanyEntity)
    private readonly repo: Repository<CompanyEntity>,
  ) {}

  // ───────────────────────── Finders ─────────────────────────

  /**
   * Paginated company list.
   * - SuperAdmin sees all companies.
   * - Tenant admin sees own company + direct children.
   */
  async findAll(
    scope: TenantScope,
    filters: ListFilterParams = {},
  ): Promise<PaginatedResult<CompanyEntity>> {
    const { page, limit, skip } = normalisePagination(filters);

    const qb = this.repo.createQueryBuilder('company');

    // Tenant scoping: own company + direct children only
    if (!scope.isSuperAdmin) {
      qb.andWhere(
        '(company.id = :companyId OR company.parent_company_id = :companyId)',
        { companyId: scope.companyId },
      );
    }

    this.applyCommonFilters(qb, filters);

    const sortBy = filters.sortBy || 'id';
    const order = filters.order || 'ASC';
    qb.orderBy(`company.${sortBy}`, order);

    qb.skip(skip).take(limit);

    const [data, total] = await qb.getManyAndCount();

    return {
      data,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  /** Find a company by its PK. SuperAdmin only – no tenant scoping. */
  async findOneById(id: number): Promise<CompanyEntity | null> {
    return this.repo.findOne({
      where: { id },
      relations: { parentCompany: true },
    });
  }

  /**
   * Find a company by PK, scoped to tenant visibility.
   * Tenant admins can only see their own company or direct children.
   */
  async findOneByIdAndCompany(
    id: number,
    scope: TenantScope,
  ): Promise<CompanyEntity | null> {
    const qb = this.repo
      .createQueryBuilder('company')
      .leftJoinAndSelect('company.parentCompany', 'parent')
      .leftJoinAndSelect('company.childCompanies', 'children')
      .where('company.id = :id', { id });

    if (!scope.isSuperAdmin) {
      qb.andWhere(
        '(company.id = :companyId OR company.parent_company_id = :companyId)',
        { companyId: scope.companyId },
      );
    }

    return qb.getOne();
  }

  /** Find company by unique code. */
  async findOneByCode(code: string): Promise<CompanyEntity | null> {
    return this.repo.findOne({ where: { code } });
  }

  /** Get direct children of a parent company. */
  async findChildCompanies(parentCompanyId: number): Promise<CompanyEntity[]> {
    return this.repo.find({ where: { parentCompanyId } });
  }

  // ───────────────────────── Existence checks ─────────────────────────

  /** Check if a company code is already in use. */
  async existsByCode(code: string): Promise<boolean> {
    return this.repo.exists({ where: { code } });
  }

  // ───────────────────────── Mutations ─────────────────────────

  /** Create and persist a new company.  */
  async createAndSave(data: Partial<CompanyEntity>): Promise<CompanyEntity> {
    const entity = this.repo.create({
      ...data,
    });
    return this.repo.save(entity);
  }

  /**
   * Update a company by id, scoped to tenant visibility.
   * Returns the updated entity or null if not found / out of scope.
   */
  async updateByIdAndCompany(
    id: number,
    scope: TenantScope,
    data: Partial<CompanyEntity>,
  ): Promise<CompanyEntity | null> {
    const existing = await this.findOneByIdAndCompany(id, scope);
    if (!existing) return null;

    Object.assign(existing, data, { updatedBy: scope.userId ?? null });
    return this.repo.save(existing);
  }

  /**
   * Soft-delete a company, scoped to tenant visibility.
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

  // ───────────────────────── Private helpers ─────────────────────────

  private applyCommonFilters(
    qb: SelectQueryBuilder<CompanyEntity>,
    filters: ListFilterParams,
  ): void {
    if (filters.search) {
      qb.andWhere('(company.name LIKE :search OR company.code LIKE :search)', {
        search: `%${filters.search}%`,
      });
    }

    if (filters.status !== undefined) {
      qb.andWhere('company.status = :status', { status: filters.status });
    }
  }
}
