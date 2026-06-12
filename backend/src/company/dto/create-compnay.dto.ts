import {
  IsOptional,
  IsString,
  MaxLength,
  IsNumber,
} from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class CreateCompanyDto {
  @IsString()
  @MaxLength(150)
  name: string;

  @IsString()
  @MaxLength(50)
  code: string;

  @IsOptional()
  @IsNumber()
  parentCompanyId?: number;

  @IsOptional()
  @IsNumber()
  status?: number;
}

export class UpdateCompanyDto extends PartialType(CreateCompanyDto) {}
