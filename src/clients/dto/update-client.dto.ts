import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateClientDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  name?: string;
}
