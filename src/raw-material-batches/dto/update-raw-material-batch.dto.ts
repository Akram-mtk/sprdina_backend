import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsInt, IsOptional, Min } from 'class-validator';

export class UpdateRawMaterialBatchDto {
  @ApiPropertyOptional({ example: 1200 })
  @IsInt()
  @Min(0)
  @IsOptional()
  unitPurchasePrice?: number;

  @ApiPropertyOptional({ example: '2026-06-10' })
  @IsDateString()
  @IsOptional()
  purchasedAt?: string;
}