import { IsString, IsNumber, IsOptional } from 'class-validator';

export class GroupAddDto {
  @IsString()
  name!: string;

  @IsNumber()
  companyId!: number;

  @IsOptional()
  @IsString()
  description?: string;
}
