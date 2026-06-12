import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsInt, IsNumber, IsPositive, Min } from 'class-validator';

export class CreateRawMaterialBatchDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @IsPositive()
  rawMaterialId: number;

  @ApiProperty({ example: 1500 })
  @IsInt()
  @Min(0)
  unitPurchasePrice: number;

  @ApiProperty({ example: 100 })
  @IsNumber()
  @IsPositive()
  initialQuantity: number;

  @ApiProperty({ example: '2026-06-01' })
  @IsDateString()
  purchasedAt: string;
}