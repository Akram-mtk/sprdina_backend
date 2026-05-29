import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateRawMaterialDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  name?: string;
}
