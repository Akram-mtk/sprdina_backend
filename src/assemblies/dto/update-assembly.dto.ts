import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, Min } from 'class-validator';

export class UpdateAssemblyDto {
  @ApiPropertyOptional({ example: 2500, description: 'Default selling price per unit, in cents' })
  @IsInt()
  @Min(0)
  @IsOptional()
  defaultSellingPrice?: number;
}
