import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { CreateAssemblyDto } from './dto/create-assembly.dto';

@Injectable()
export class AssembliesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.assembly.findMany({
      include: { assemblyTemplate: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOneOrThrow(id: number) {
    const assembly = await this.prisma.assembly.findUnique({
      where: { id },
      include: {
        assemblyTemplate: true,
        items: {
          include: { rawMaterial: true, rawMaterialBatch: true },
        },
      },
    });
    if (!assembly) throw new NotFoundException(`Assembly #${id} not found`);
    return assembly;
  }

  async create(dto: CreateAssemblyDto) {
    return this.prisma.$transaction(async (tx) => {
      const template = await tx.assemblyTemplate.findFirst({
        where: { id: dto.assemblyTemplateId, deletedAt: null },
        include: { items: true },
      });
      if (!template)
        throw new NotFoundException(
          `AssemblyTemplate #${dto.assemblyTemplateId} not found`,
        );
      if (template.items.length === 0)
        throw new BadRequestException('Template has no items');

      const templateMaterialIds = new Set(
        template.items.map((i) => i.rawMaterialId),
      );
      const inputMaterialIds = new Set(
        dto.batches.map((b) => b.rawMaterialId),
      );

      for (const mid of templateMaterialIds) {
        if (!inputMaterialIds.has(mid))
          throw new BadRequestException(
            `Missing batch allocation for rawMaterialId ${mid}`,
          );
      }
      for (const mid of inputMaterialIds) {
        if (!templateMaterialIds.has(mid))
          throw new BadRequestException(
            `rawMaterialId ${mid} is not part of this template`,
          );
      }

      for (const allocation of dto.batches) {
        const templateItem = template.items.find(
          (i) => i.rawMaterialId === allocation.rawMaterialId,
        )!;
        const expected =
          templateItem.quantityPerUnit * dto.quantityAssembled;
        if (allocation.quantityUsed !== expected)
          throw new BadRequestException(
            `rawMaterialId ${allocation.rawMaterialId}: expected quantityUsed ${expected}, got ${allocation.quantityUsed}`,
          );

        const batch = await tx.rawMaterialBatch.findUnique({
          where: { id: allocation.rawMaterialBatchId },
        });
        if (!batch)
          throw new NotFoundException(
            `RawMaterialBatch #${allocation.rawMaterialBatchId} not found`,
          );
        if (batch.rawMaterialId !== allocation.rawMaterialId)
          throw new BadRequestException(
            `Batch #${allocation.rawMaterialBatchId} does not belong to rawMaterialId ${allocation.rawMaterialId}`,
          );
        if (batch.remainingQuantity < allocation.quantityUsed)
          throw new BadRequestException(
            `Batch #${allocation.rawMaterialBatchId} has only ${batch.remainingQuantity} units remaining, need ${allocation.quantityUsed}`,
          );

        await tx.rawMaterialBatch.update({
          where: { id: allocation.rawMaterialBatchId },
          data: { remainingQuantity: { decrement: allocation.quantityUsed } },
        });
      }

      return tx.assembly.create({
        data: {
          assemblyTemplateId: dto.assemblyTemplateId,
          quantityAssembled: dto.quantityAssembled,
          remainingQuantity: dto.quantityAssembled,
          items: {
            create: dto.batches.map((b) => ({
              rawMaterialId: b.rawMaterialId,
              rawMaterialBatchId: b.rawMaterialBatchId,
            })),
          },
        },
        include: {
          assemblyTemplate: true,
          items: { include: { rawMaterial: true, rawMaterialBatch: true } },
        },
      });
    });
  }
}
