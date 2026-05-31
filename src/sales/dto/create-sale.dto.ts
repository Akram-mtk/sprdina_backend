import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsInt,
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
  @IsString()
  clientName: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateSaleItemDto)
  items: CreateSaleItemDto[];
}
