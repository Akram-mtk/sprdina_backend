import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

export class CreateSaleItemDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @IsPositive()
  assemblyId: number;

  @ApiProperty({ example: 5 })
  @IsInt()
  @IsPositive()
  quantitySold: number;

  @ApiProperty({ example: 3000 })
  @IsInt()
  @Min(0)
  sellingPricePerUnit: number;
}

export class CreateSaleDto {
  @ApiPropertyOptional({ example: 'someone' })
  @IsOptional()
  @IsString()
  clientName?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  @IsPositive()
  clientId?: number;

  @ApiProperty({
    type: [CreateSaleItemDto],
    example: [{ assemblyId: 1, quantitySold: 5, sellingPricePerUnit: 3000 }],
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateSaleItemDto)
  items: CreateSaleItemDto[];
}