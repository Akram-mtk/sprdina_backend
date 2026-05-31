import { IsDateString, IsInt, IsPositive, Min } from 'class-validator';

export class CreateRawMaterialBatchDto {
  @IsInt()
  @IsPositive()
  rawMaterialId: number;

  @IsInt()
  @Min(0)
  unitPurchasePrice: number;

  @IsInt()
  @IsPositive()
  initialQuantity: number;

  @IsDateString()
  purchasedAt: string;
}
