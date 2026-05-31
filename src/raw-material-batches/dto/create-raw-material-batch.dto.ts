import { IsDateString, IsInt, IsNumber, IsPositive, Min } from 'class-validator';

export class CreateRawMaterialBatchDto {
  @IsInt()
  @IsPositive()
  rawMaterialId: number;

  @IsInt()
  @Min(0)
  unitPurchasePrice: number;

  @IsNumber()
  @IsPositive()
  initialQuantity: number;

  @IsDateString()
  purchasedAt: string;
}
