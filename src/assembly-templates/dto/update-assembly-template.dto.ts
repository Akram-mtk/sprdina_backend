import { IsNotEmpty, IsNumber, IsOptional, IsString, IsPositive } from 'class-validator';

export class UpdateAssemblyTemplateDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  name?: string;
}

export class UpdateAssemblyTemplateItemDto {
  @IsNumber()
  @IsPositive()
  quantityPerUnit: number;
}