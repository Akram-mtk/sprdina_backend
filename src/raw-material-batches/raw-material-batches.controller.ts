import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';

import { CreateRawMaterialBatchDto } from './dto/create-raw-material-batch.dto';
import { UpdateRawMaterialBatchDto } from './dto/update-raw-material-batch.dto';
import { RawMaterialBatchesService } from './raw-material-batches.service';

@Controller('raw-material-batches')
export class RawMaterialBatchesController {
  constructor(private readonly service: RawMaterialBatchesService) {}

  @Get()
  findAll(@Query('rawMaterialId', new ParseIntPipe({ optional: true })) rawMaterialId?: number) {
    return this.service.findAll(rawMaterialId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOneOrThrow(id);
  }

  @Post()
  create(@Body() dto: CreateRawMaterialBatchDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateRawMaterialBatchDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
