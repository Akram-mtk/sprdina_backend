import { IsNotEmpty, IsOptional, IsString, IsInt, IsPositive } from 'class-validator';

export class UpdateAssemblyTemplateDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  name?: string;
}

export class UpdateAssemblyTemplateItemDto {
  @IsInt()
  @IsPositive()
  quantityPerUnit: number;
}