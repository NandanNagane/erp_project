import { IsOptional, IsString, IsNumber } from 'class-validator';

export class GroupUpdateDto {
  @IsNumber()
  id!: number;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  status?: number;
}