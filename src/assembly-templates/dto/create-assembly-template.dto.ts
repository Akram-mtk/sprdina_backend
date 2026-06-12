import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  ValidateNested,
} from 'class-validator';

export class CreateAssemblyTemplateItemDto {
  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  rawMaterialId: number;

  @ApiProperty({ example: 4 })
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  quantityPerUnit: number;
}

export class CreateAssemblyTemplateDto {
  @ApiProperty({ example: 'batata souvide' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({
    type: [CreateAssemblyTemplateItemDto],
    example: [{ rawMaterialId: 1, quantityPerUnit: 4 }],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateAssemblyTemplateItemDto)
  @IsOptional()
  items?: CreateAssemblyTemplateItemDto[];
}