import { IsInt, IsPositive } from 'class-validator';

export class CreateAssemblyTemplateItemDto {
  @IsInt()
  @IsPositive()
  rawMaterialId: number;

  @IsInt()
  @IsPositive()
  quantityPerUnit: number;
}
