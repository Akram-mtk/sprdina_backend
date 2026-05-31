import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional, IsString, IsPositive } from 'class-validator';

export class UpdateAssemblyTemplateDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  name?: string;
}

export class UpdateAssemblyTemplateItemDto {
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  quantityPerUnit: number;
}