import { IsInt, IsPositive } from 'class-validator';

export class UpdateAssemblyTemplateItemDto {
  @IsInt()
  @IsPositive()
  quantityPerUnit: number;
}
