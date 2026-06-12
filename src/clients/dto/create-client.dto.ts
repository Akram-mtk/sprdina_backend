import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateClientDto {
  @ApiProperty({ example: 'MC BEL' })
  @IsString()
  @IsNotEmpty()
  name: string;
}