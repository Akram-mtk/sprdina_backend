import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
  IsInt,
  IsPositive
} from 'class-validator';


export class CreateAssemblyTemplateDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateAssemblyTemplateItemDto)
  @IsOptional()
  items?: CreateAssemblyTemplateItemDto[];
}

export class CreateAssemblyTemplateItemDto {
  @IsInt()
  @IsPositive()
  rawMaterialId: number;

  @IsInt()
  @IsPositive()
  quantityPerUnit: number;
}