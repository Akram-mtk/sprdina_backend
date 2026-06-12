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
  @IsInt()
  @IsPositive()
  assemblyId: number;

  @IsInt()
  @IsPositive()
  quantitySold: number;

  @IsInt()
  @Min(0)
  sellingPricePerUnit: number;
}

export class CreateSaleDto {
  @IsOptional()
  @IsString()
  clientName?: string;

  @IsOptional()
  @IsInt()
  @IsPositive()
  clientId?: number;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateSaleItemDto)
  items: CreateSaleItemDto[];
}
