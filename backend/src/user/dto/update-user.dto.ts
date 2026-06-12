import {
  IsDateString,
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  IsNumber,
} from 'class-validator';

export class UserUpdateDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsDateString()
  dob?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsNumber()
  status?: number;

  @IsOptional()
  @IsInt()
  groupId?: number;

  @IsOptional()
  @IsInt()
  companyId?: number;
}