import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Query,
  Req,
  ParseIntPipe,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { Request } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerConfig } from '../packages/configs/multer.config';

import { CompanyService } from './sevice/company.service';
import { CompanyListService } from './sevice/company.list.service';
import { CreateCompanyDto, UpdateCompanyDto } from './dto/create-compnay.dto';
import {
  ListFilterParams,
  TenantScope,
} from '../packages/interfaces/list-filter.interface';

@Controller('company')
export class CompanyController {
  constructor(
    private readonly companyService: CompanyService,
    private readonly companyListService: CompanyListService,
  ) {}

  private getScope(req: Request): TenantScope {
    const user: any = req['user'];
    if (!user) {
      throw new Error('User context missing. Ensure AuthGuard is applied.');
    }
    return {
      companyId: user.companyId,
      isSuperAdmin: user.isSuperAdmin === 1 || user.isSuperAdmin === true,
      userId: user.sub,
      role: user.role,
    };
  }

  @Post('create')
  @UseInterceptors(FileInterceptor('coverImg', multerConfig))
  async create(
    @Req() req: Request,
    @Body() createCompanyDto: CreateCompanyDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const company = await this.companyService.create(
      this.getScope(req),
      createCompanyDto,
      file,
    );
    return {
      success: 1,
      message: 'Company created successfully',
      data: company,
    };
  }

  @Get('list')
  async findAll(@Req() req: Request, @Query() filters: ListFilterParams) {
    const result = await this.companyService.findAll(
      this.getScope(req),
      filters,
    );
    return {
      success: 1,
      message: 'Companies fetched successfully',
      data: result,
    };
  }

  @Get('details/:id')
  async findOne(@Req() req: Request, @Param('id', ParseIntPipe) id: number) {
    const company = await this.companyService.findOne(id, this.getScope(req));
    return {
      success: 1,
      message: 'Company fetched successfully',
      data: company,
    };
  }

  @Put('update/:id')
  @UseInterceptors(FileInterceptor('coverImg', multerConfig))
  async update(
    @Req() req: Request,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCompanyDto: UpdateCompanyDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const company = await this.companyService.update(
      id,
      this.getScope(req),
      updateCompanyDto,
      file,
    );
    return {
      success: 1,
      message: 'Company updated successfully',
      data: company,
    };
  }

  @Delete('delete/:id')
  async remove(@Req() req: Request, @Param('id', ParseIntPipe) id: number) {
    await this.companyService.remove(id, this.getScope(req));
    return {
      success: 1,
      message: 'Company deleted successfully',
    };
  }

  @Put('update-cover-img/:id')
  @UseInterceptors(FileInterceptor('coverImg', multerConfig))
  async updateCoverImg(
    @Req() req: Request,
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const company = await this.companyService.updateCoverImg(
      id,
      this.getScope(req),
      file,
    );
    return {
      success: 1,
      message: 'Cover image updated successfully',
      data: company,
    };
  }

  @Delete('delete-cover-img/:id')
  async deleteCoverImg(
    @Req() req: Request,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const company = await this.companyService.deleteCoverImg(
      id,
      this.getScope(req),
    );
    return {
      success: 1,
      message: 'Cover image deleted successfully',
      data: company,
    };
  }
}
