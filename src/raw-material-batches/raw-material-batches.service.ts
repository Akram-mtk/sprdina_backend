import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { CreateRawMaterialBatchDto } from './dto/create-raw-material-batch.dto';
import { UpdateRawMaterialBatchDto } from './dto/update-raw-material-batch.dto';

@Injectable()
export class RawMaterialBatchesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(rawMaterialId?: number) {
    return this.prisma.rawMaterialBatch.findMany({
      where: rawMaterialId ? { rawMaterialId } : undefined,
      include: { rawMaterial: true },
      orderBy: { purchasedAt: 'asc' },
    });
  }

  async findOneOrThrow(id: number) {
    const batch = await this.prisma.rawMaterialBatch.findUnique({
      where: { id },
      include: { rawMaterial: true },
    });
    if (!batch) throw new NotFoundException(`RawMaterialBatch #${id} not found`);
    return batch;
  }

  async create(dto: CreateRawMaterialBatchDto) {
    const material = await this.prisma.rawMaterial.findFirst({
      where: { id: dto.rawMaterialId, deletedAt: null },
    });
    if (!material)
      throw new NotFoundException(`RawMaterial #${dto.rawMaterialId} not found`);

    return this.prisma.rawMaterialBatch.create({
      data: {
        rawMaterialId: dto.rawMaterialId,
        unitPurchasePrice: dto.unitPurchasePrice,
        initialQuantity: dto.initialQuantity,
        remainingQuantity: dto.initialQuantity,
        purchasedAt: new Date(dto.purchasedAt),
      },
    });
  }

  async update(id: number, dto: UpdateRawMaterialBatchDto) {
    await this.findOneOrThrow(id);
    return this.prisma.rawMaterialBatch.update({
      where: { id },
      data: {
        ...(dto.unitPurchasePrice !== undefined && {
          unitPurchasePrice: dto.unitPurchasePrice,
        }),
        ...(dto.purchasedAt !== undefined && {
          purchasedAt: new Date(dto.purchasedAt),
        }),
      },
    });
  }

  // Moves a stranded remainder into another batch of the same material so it
  // stays usable (assemblies can't split one material across batches). The
  // moved quantity takes on the target batch's purchase price in future cost
  // calculations; initialQuantity stays untouched as purchase history.
  async mergeInto(sourceId: number, targetId: number) {
    if (sourceId === targetId)
      throw new BadRequestException('Cannot merge a batch into itself');

    return this.prisma.$transaction(async (tx) => {
      const source = await tx.rawMaterialBatch.findUnique({
        where: { id: sourceId },
      });
      if (!source)
        throw new NotFoundException(`RawMaterialBatch #${sourceId} not found`);
      const target = await tx.rawMaterialBatch.findUnique({
        where: { id: targetId },
      });
      if (!target)
        throw new NotFoundException(`RawMaterialBatch #${targetId} not found`);

      if (source.rawMaterialId !== target.rawMaterialId)
        throw new BadRequestException(
          'Batches must belong to the same raw material',
        );
      if (source.remainingQuantity.lte(0))
        throw new BadRequestException(
          `RawMaterialBatch #${sourceId} has no remaining quantity to merge`,
        );

      // Atomic guard: only zero the source if its remaining quantity hasn't
      // changed since we read it, so a concurrent assembly can't consume
      // stock that we then double-count into the target.
      const zeroed = await tx.rawMaterialBatch.updateMany({
        where: { id: sourceId, remainingQuantity: source.remainingQuantity },
        data: { remainingQuantity: 0 },
      });
      if (zeroed.count === 0)
        throw new BadRequestException(
          `RawMaterialBatch #${sourceId} was modified concurrently, retry the merge`,
        );

      return tx.rawMaterialBatch.update({
        where: { id: targetId },
        data: { remainingQuantity: { increment: source.remainingQuantity } },
        include: { rawMaterial: true },
      });
    });
  }

  async remove(id: number) {
    const batch = await this.findOneOrThrow(id);
    if (!batch.remainingQuantity.equals(batch.initialQuantity)) {
      throw new BadRequestException(
        'Batch has been partially or fully consumed and cannot be deleted',
      );
    }
    return this.prisma.rawMaterialBatch.delete({ where: { id } });
  }
}
