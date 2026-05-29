import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

import { CreateAssemblyTemplateItemDto } from './create-assembly-template-item.dto';

export class CreateAssemblyTemplateDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateAssemblyTemplateItemDto)
  @IsOptional()
  items?: CreateAssemblyTemplateItemDto[];
}
