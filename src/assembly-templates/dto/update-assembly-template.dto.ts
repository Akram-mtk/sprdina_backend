import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateAssemblyTemplateDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  name?: string;
}
