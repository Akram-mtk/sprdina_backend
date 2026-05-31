import { IsDateString, IsInt, IsOptional, Min } from 'class-validator';

export class UpdateRawMaterialBatchDto {
  @IsInt()
  @Min(0)
  @IsOptional()
  unitPurchasePrice?: number;

  @IsDateString()
  @IsOptional()
  purchasedAt?: string;
}
