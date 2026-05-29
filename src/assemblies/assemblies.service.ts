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

      const batches = await tx.rawMaterialBatch.findMany({
        where: { id: { in: dto.batches.map((b) => b.rawMaterialBatchId) } },
      });
      const batchById = new Map(batches.map((b) => [b.id, b]));

      for (const allocation of dto.batches) {
        const batch = batchById.get(allocation.rawMaterialBatchId);
        if (!batch)
          throw new NotFoundException(
            `RawMaterialBatch #${allocation.rawMaterialBatchId} not found`,
          );
      }

      const templateMaterialIds = new Set(
        template.items.map((i) => i.rawMaterialId),
      );
      const inputMaterialIds = new Set(
        dto.batches.map((b) => batchById.get(b.rawMaterialBatchId)!.rawMaterialId),
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
        const batch = batchById.get(allocation.rawMaterialBatchId)!;
        const templateItem = template.items.find(
          (i) => i.rawMaterialId === batch.rawMaterialId,
        )!;
        const quantityUsed = templateItem.quantityPerUnit * dto.quantityAssembled;
        if (batch.remainingQuantity < quantityUsed)
          throw new BadRequestException(
            `RawMaterialBatch #${batch.id} has only ${batch.remainingQuantity} units remaining, need ${quantityUsed}`,
          );

        await tx.rawMaterialBatch.update({
          where: { id: batch.id },
          data: { remainingQuantity: { decrement: quantityUsed } },
        });
      }

      return tx.assembly.create({
        data: {
          assemblyTemplateId: dto.assemblyTemplateId,
          quantityAssembled: dto.quantityAssembled,
          remainingQuantity: dto.quantityAssembled,
          items: {
            create: dto.batches.map((b) => {
              const batch = batchById.get(b.rawMaterialBatchId)!;
              const templateItem = template.items.find(
                (i) => i.rawMaterialId === batch.rawMaterialId,
              )!;
              return {
                rawMaterialId: batch.rawMaterialId,
                rawMaterialBatchId: b.rawMaterialBatchId,
                quantityPerUnit: templateItem.quantityPerUnit,
              };
            }),
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
