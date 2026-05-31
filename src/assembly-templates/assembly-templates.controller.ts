import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';

import { AssemblyTemplatesService } from './assembly-templates.service';
import { CreateAssemblyTemplateDto, CreateAssemblyTemplateItemDto } from './dto/create-assembly-template.dto';
import { UpdateAssemblyTemplateDto, UpdateAssemblyTemplateItemDto } from './dto/update-assembly-template.dto';

@Controller('assembly-templates')
export class AssemblyTemplatesController {
  constructor(private readonly service: AssemblyTemplatesService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOneOrThrow(id);
  }

  @Post()
  create(@Body() dto: CreateAssemblyTemplateDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAssemblyTemplateDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  softDelete(@Param('id', ParseIntPipe) id: number) {
    return this.service.softDelete(id);
  }

  @Get(':id/items')
  findItems(@Param('id', ParseIntPipe) id: number) {
    return this.service.findItems(id);
  }

  @Post(':id/items')
  addItem(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateAssemblyTemplateItemDto,
  ) {
    return this.service.addItem(id, dto);
  }

  @Patch(':id/items/:itemId')
  updateItem(
    @Param('id', ParseIntPipe) id: number,
    @Param('itemId', ParseIntPipe) itemId: number,
    @Body() dto: UpdateAssemblyTemplateItemDto,
  ) {
    return this.service.updateItem(id, itemId, dto);
  }

  @Delete(':id/items/:itemId')
  @HttpCode(204)
  removeItem(
    @Param('id', ParseIntPipe) id: number,
    @Param('itemId', ParseIntPipe) itemId: number,
  ) {
    return this.service.removeItem(id, itemId);
  }
}
