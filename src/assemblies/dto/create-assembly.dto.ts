import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsPositive,
  ValidateNested,
} from 'class-validator';

export class CreateAssemblyBatchAllocationDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @IsPositive()
  rawMaterialBatchId: number;
}

export class CreateAssemblyDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @IsPositive()
  assemblyTemplateId: number;

  @ApiProperty({ example: 10 })
  @IsInt()
  @IsPositive()
  quantityAssembled: number;

  @ApiProperty({
    type: [CreateAssemblyBatchAllocationDto],
    example: [{ rawMaterialBatchId: 1 }],
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateAssemblyBatchAllocationDto)
  batches: CreateAssemblyBatchAllocationDto[];
}