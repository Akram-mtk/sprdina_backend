import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRawMaterialDto } from './dto/create-raw-material.dto';
import { UpdateRawMaterialDto } from './dto/update-raw-material.dto';

@Injectable()
export class RawMaterialsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.rawMaterial.findMany({
      where: { deletedAt: null },
    });
  }

  async findOneOrThrow(id: number) {
    const material = await this.prisma.rawMaterial.findFirst({
      where: { id, deletedAt: null },
    });
    if (!material) throw new NotFoundException(`RawMaterial #${id} not found`);
    return material;
  }

  create(dto: CreateRawMaterialDto) {
    return this.prisma.rawMaterial.create({ data: { name: dto.name } });
  }

  async update(id: number, dto: UpdateRawMaterialDto) {
    await this.findOneOrThrow(id);
    return this.prisma.rawMaterial.update({ where: { id }, data: dto });
  }

  async softDelete(id: number) {
    await this.findOneOrThrow(id);
    return this.prisma.rawMaterial.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
