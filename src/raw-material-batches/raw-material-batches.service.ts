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

  async remove(id: number) {
    const batch = await this.findOneOrThrow(id);
    if (batch.remainingQuantity !== batch.initialQuantity) {
      throw new BadRequestException(
        'Batch has been partially or fully consumed and cannot be deleted',
      );
    }
    return this.prisma.rawMaterialBatch.delete({ where: { id } });
  }
}
