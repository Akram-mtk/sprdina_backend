import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';

export class UpdateAssemblyTemplateDto {
  @ApiPropertyOptional({ example: 'batata souvide 5kg' })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  name?: string;
}

export class UpdateAssemblyTemplateItemDto {
  @ApiProperty({ example: 3 })
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  quantityPerUnit: number;
}