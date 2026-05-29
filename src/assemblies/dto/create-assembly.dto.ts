import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsPositive,
  ValidateNested,
} from 'class-validator';

export class CreateAssemblyBatchAllocationDto {
  @IsInt()
  @IsPositive()
  rawMaterialBatchId: number;

  @IsInt()
  @IsPositive()
  rawMaterialId: number;

  @IsInt()
  @IsPositive()
  quantityUsed: number;
}

export class CreateAssemblyDto {
  @IsInt()
  @IsPositive()
  assemblyTemplateId: number;

  @IsInt()
  @IsPositive()
  quantityAssembled: number;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateAssemblyBatchAllocationDto)
  batches: CreateAssemblyBatchAllocationDto[];
}
