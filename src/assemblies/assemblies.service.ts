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

      // it check rawMat unique in assemblie, remove it from schema
      const templateMaterialIds = new Set(
        template.items.map((i) => i.rawMaterialId),
      );
      const inputMaterialIds = new Set(
        dto.batches.map((b) => batchById.get(b.rawMaterialBatchId)!.rawMaterialId),
      );
      if (inputMaterialIds.size !== dto.batches.length)
        throw new BadRequestException(
          'Each rawMaterial may have at most one batch allocation per assembly',
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
        const quantityUsed = templateItem.quantityPerUnit.mul(dto.quantityAssembled);

        // Atomic guard: only decrement if enough stock remains, so two
        // concurrent assemblies can't both pass a stale check and oversell.
        const updated = await tx.rawMaterialBatch.updateMany({
          where: { id: batch.id, remainingQuantity: { gte: quantityUsed } },
          data: { remainingQuantity: { decrement: quantityUsed } },
        });
        if (updated.count === 0)
          throw new BadRequestException(
            `RawMaterialBatch #${batch.id} has only ${batch.remainingQuantity} units remaining, need ${quantityUsed}`,
          );
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
  // NOTE : curiosity brk, machi kon n5li fetches outside transaction ?
  async remove(id: number) {
    return this.prisma.$transaction(async (tx) => {
      const assembly = await tx.assembly.findUnique({
        where: { id },
        include: { items: true },
      });
      if (!assembly) throw new NotFoundException(`Assembly #${id} not found`);

      const saleItemCount = await tx.saleItem.count({ where: { assemblyId: id } });
      if (saleItemCount > 0)
        throw new BadRequestException(
          'Cannot delete assembly with existing sales — delete the sales first',
        );

      for (const item of assembly.items) {
        await tx.rawMaterialBatch.update({
          where: { id: item.rawMaterialBatchId },
          data: { remainingQuantity: { increment: item.quantityPerUnit.mul(assembly.quantityAssembled) } },
        });
      }

      await tx.assemblyItem.deleteMany({ where: { assemblyId: id } });
      return tx.assembly.delete({ where: { id } });
    });
  }
}
