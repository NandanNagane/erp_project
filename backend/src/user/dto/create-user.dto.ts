import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsOptional,
  IsString,
  MinLength,
  MaxLength,
  Matches,
  IsDateString,
  IsInt,
  IsNumber,
  IsEnum,
  IsNotEmpty,
} from 'class-validator';
import { Role } from 'src/packages/role.enum';

export class CreateUserDto {
  @IsString()
  @MinLength(2)
  @MaxLength(150)
  name: string;

  @IsString()
  @MinLength(3)
  @MaxLength(100)
  username: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[A-Z])(?=.*\d)/, {
    message: 'Password must contain uppercase and digit',
  })
  password: string;

  @Transform(({ value }) => (value !== undefined ? Number(value) : undefined))
  @IsInt()
  companyId!: number;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  phone?: string;

  @IsOptional()
  @IsDateString()
  dob?: string;

  @IsOptional()
  @IsNumber()
  groupId?: number;

  @IsNotEmpty()
  @IsEnum(Role)
  role: Role;
}
