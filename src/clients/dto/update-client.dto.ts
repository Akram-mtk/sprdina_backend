import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateClientDto {
  @ApiPropertyOptional({ example: 'fajitas' })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  name?: string;
}