import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';

import { AssembliesService } from './assemblies.service';
import { CreateAssemblyDto } from './dto/create-assembly.dto';

@Controller('assemblies')
export class AssembliesController {
  constructor(private readonly service: AssembliesService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOneOrThrow(id);
  }

  @Post()
  create(@Body() dto: CreateAssemblyDto) {
    return this.service.create(dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
