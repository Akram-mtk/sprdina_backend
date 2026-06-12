import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateRawMaterialDto {
  @ApiProperty({ example: 'potato' })
  @IsString()
  @IsNotEmpty()
  name: string;
}