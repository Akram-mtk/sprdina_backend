import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateRawMaterialDto {
  @ApiPropertyOptional({ example: 'batata' })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  name?: string;
}