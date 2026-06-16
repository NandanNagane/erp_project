import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { CompanyEntity } from '../entities/company.entity';
import { GeneralUtilities } from '../../packages/utilities/general.utility';
import { CompaniesRepository } from '../repositories/companies.repository';
import { TenantScope, PaginatedResult, ListFilterParams } from '../../packages/interfaces/list-filter.interface';
import { CreateCompanyDto, UpdateCompanyDto } from '../dto/create-compnay.dto';
import { FileStorageService } from '../../packages/service/file-storage.service';

@Injectable()
export class CompanyService {
  constructor(
    private readonly companiesRepo: CompaniesRepository,
    private readonly general: GeneralUtilities,
    private readonly fileStorageService: FileStorageService,
  ) {}

  async create(
    scope: TenantScope,
    dto: CreateCompanyDto,
    file?: Express.Multer.File,
  ): Promise<CompanyEntity> {
    if (await this.companiesRepo.existsByCode(dto.code)) {
      throw new ConflictException('Company code already in use');
    }

    const company = await this.companiesRepo.createAndSave({
      name: dto.name,
      code: dto.code,
      parentCompanyId: dto.parentCompanyId,
      status: dto.status ?? 1,
      createdBy: scope.userId,
    });

    if (file) {
      const { fileName } = await this.fileStorageService.moveFile(file, 'company');
      await this.companiesRepo.updateByIdAndCompany(company.id, { ...scope, isSuperAdmin: true }, { coverImg: fileName });
      company.coverImg = fileName;
    }

    return company;
  }

  async findAll(
    scope: TenantScope,
    filters: ListFilterParams,
  ): Promise<PaginatedResult<CompanyEntity>> {
    return this.companiesRepo.findAll(scope, filters);
  }

  async findOne(id: number, scope: TenantScope): Promise<CompanyEntity> {
    const company = await this.companiesRepo.findOneByIdAndCompany(id, scope);
    if (!company) {
      throw new NotFoundException(`Company with ID ${id} not found`);
    }
    return company;
  }

  async update(
    id: number,
    scope: TenantScope,
    dto: UpdateCompanyDto,
    file?: Express.Multer.File,
  ): Promise<CompanyEntity> {
    if (dto.code) {
      const existingCode = await this.companiesRepo.findOneByCode(dto.code);
      if (existingCode && existingCode.id !== id) {
        throw new ConflictException('Company code already in use');
      }
    }

    const updatedCompany = await this.companiesRepo.updateByIdAndCompany(id, scope, dto);
    if (!updatedCompany) {
      throw new NotFoundException(`Company with ID ${id} not found`);
    }

    if (file) {
      if (updatedCompany.coverImg) {
        await this.fileStorageService.deleteFile(updatedCompany.coverImg, 'company');
      }
      const { fileName } = await this.fileStorageService.moveFile(file, 'company');
      await this.companiesRepo.updateByIdAndCompany(id, scope, { coverImg: fileName });
      updatedCompany.coverImg = fileName;
    }

    return updatedCompany;
  }

  async remove(id: number, scope: TenantScope): Promise<void> {
    const company = await this.findOne(id, scope);
    const deleted = await this.companiesRepo.softDeleteByIdAndCompany(id, scope);
    if (!deleted) {
      throw new NotFoundException(`Company with ID ${id} not found`);
    }

    if (company.coverImg) {
      await this.fileStorageService.deleteFile(company.coverImg, 'company');
    }
  }

  async updateCoverImg(id: number, scope: TenantScope, file: Express.Multer.File): Promise<CompanyEntity> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const company = await this.findOne(id, scope);
    
    if (company.coverImg) {
      await this.fileStorageService.deleteFile(company.coverImg, 'company');
    }

    const { fileName } = await this.fileStorageService.moveFile(file, 'company');
    await this.companiesRepo.updateByIdAndCompany(id, scope, { coverImg: fileName });
    
    company.coverImg = fileName;
    return company;
  }

  async deleteCoverImg(id: number, scope: TenantScope): Promise<CompanyEntity> {
    const company = await this.findOne(id, scope);

    if (company.coverImg) {
      await this.fileStorageService.deleteFile(company.coverImg, 'company');
      await this.companiesRepo.updateByIdAndCompany(id, scope, { coverImg: null });
      company.coverImg = null;
    }

    return company;
  }
}
