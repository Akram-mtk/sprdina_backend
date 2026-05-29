import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { CreateAssemblyTemplateDto } from './dto/create-assembly-template.dto';
import { CreateAssemblyTemplateItemDto } from './dto/create-assembly-template-item.dto';
import { UpdateAssemblyTemplateDto } from './dto/update-assembly-template.dto';
import { UpdateAssemblyTemplateItemDto } from './dto/update-assembly-template-item.dto';

@Injectable()
export class AssemblyTemplatesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.assemblyTemplate.findMany({
      where: { deletedAt: null },
      include: { items: { include: { rawMaterial: true } } },
    });
  }

  async findOneOrThrow(id: number) {
    const template = await this.prisma.assemblyTemplate.findFirst({
      where: { id, deletedAt: null },
      include: { items: { include: { rawMaterial: true } } },
    });
    if (!template)
      throw new NotFoundException(`AssemblyTemplate #${id} not found`);
    return template;
  }

  async create(dto: CreateAssemblyTemplateDto) {
    return this.prisma.assemblyTemplate.create({
      data: {
        name: dto.name,
        items: dto.items
          ? {
              create: dto.items.map((item) => ({
                rawMaterialId: item.rawMaterialId,
                quantityPerUnit: item.quantityPerUnit,
              })),
            }
          : undefined,
      },
      include: { items: { include: { rawMaterial: true } } },
    });
  }

  async update(id: number, dto: UpdateAssemblyTemplateDto) {
    await this.findOneOrThrow(id);
    return this.prisma.assemblyTemplate.update({
      where: { id },
      data: dto,
      include: { items: { include: { rawMaterial: true } } },
    });
  }

  async softDelete(id: number) {
    await this.findOneOrThrow(id);
    return this.prisma.assemblyTemplate.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async findItems(templateId: number) {
    await this.findOneOrThrow(templateId);
    return this.prisma.assemblyTemplateItem.findMany({
      where: { assemblyTemplateId: templateId },
      include: { rawMaterial: true },
    });
  }

  async addItem(templateId: number, dto: CreateAssemblyTemplateItemDto) {
    await this.findOneOrThrow(templateId);

    const material = await this.prisma.rawMaterial.findFirst({
      where: { id: dto.rawMaterialId, deletedAt: null },
    });
    if (!material)
      throw new NotFoundException(`RawMaterial #${dto.rawMaterialId} not found`);

    try {
      return await this.prisma.assemblyTemplateItem.create({
        data: {
          assemblyTemplateId: templateId,
          rawMaterialId: dto.rawMaterialId,
          quantityPerUnit: dto.quantityPerUnit,
        },
        include: { rawMaterial: true },
      });
    } catch (e: any) {
      if (e?.code === 'P2002')
        throw new ConflictException(
          'This material already exists in the template',
        );
      throw e;
    }
  }

  async updateItem(
    templateId: number,
    itemId: number,
    dto: UpdateAssemblyTemplateItemDto,
  ) {
    const item = await this.prisma.assemblyTemplateItem.findFirst({
      where: { id: itemId, assemblyTemplateId: templateId },
    });
    if (!item)
      throw new NotFoundException(
        `AssemblyTemplateItem #${itemId} not found on template #${templateId}`,
      );
    return this.prisma.assemblyTemplateItem.update({
      where: { id: itemId },
      data: { quantityPerUnit: dto.quantityPerUnit },
      include: { rawMaterial: true },
    });
  }

  async removeItem(templateId: number, itemId: number) {
    const item = await this.prisma.assemblyTemplateItem.findFirst({
      where: { id: itemId, assemblyTemplateId: templateId },
    });
    if (!item)
      throw new NotFoundException(
        `AssemblyTemplateItem #${itemId} not found on template #${templateId}`,
      );
    await this.prisma.assemblyTemplateItem.delete({ where: { id: itemId } });
  }
}
