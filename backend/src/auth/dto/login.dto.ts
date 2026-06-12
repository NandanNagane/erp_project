import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class loginDto {
  @IsNotEmpty()
  @IsString()
  username: string;

  @IsNotEmpty()
  password: string;

  @IsOptional()
  @IsBoolean()
  rememberMe: boolean;
}
