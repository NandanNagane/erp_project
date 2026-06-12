import { IsEnum, IsOptional, ValidateNested } from 'class-validator';
export enum AllowedTypes {
  'image/jpg'='image/jpg',
  'image/jpeg'='image/jpeg'

}
export class commonFileDto {
  @IsOptional()
  @IsEnum(AllowedTypes)
  file?: string;
}