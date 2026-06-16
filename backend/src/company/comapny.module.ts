import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompanyEntity } from './entities/company.entity';
import { CompanyService } from './sevice/company.service';
import { CompanyListService } from './sevice/company.list.service';
import { GeneralUtilities } from '../packages/utilities/general.utility';
import { CompanyController } from './company.controller';
import { CompaniesRepository } from './repositories/companies.repository';
import { FileStorageService } from '../packages/service/file-storage.service';

@Module({
  imports: [TypeOrmModule.forFeature([CompanyEntity])],
  controllers: [CompanyController],
  providers: [CompanyService, CompanyListService, GeneralUtilities, CompaniesRepository, FileStorageService],
  exports: [CompanyService, CompanyListService, CompaniesRepository],
})
export class CompanyModule {}
