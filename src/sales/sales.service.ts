import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { CreateSaleDto } from './dto/create-sale.dto';

@Injectable()
export class SalesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.sale.findMany({
      include: {
        items: { include: { assembly: { include: { assemblyTemplate: true } } } },
      },
      orderBy: { soldAt: 'desc' },
    });
  }

  async findOneOrThrow(id: number) {
    const sale = await this.prisma.sale.findUnique({
      where: { id },
      include: {
        items: { include: { assembly: { include: { assemblyTemplate: true } } } },
      },
    });
    if (!sale) throw new NotFoundException(`Sale #${id} not found`);
    return sale;
  }

  async create(dto: CreateSaleDto) {
    return this.prisma.$transaction(async (tx) => {
      for (const item of dto.items) {
        const assembly = await tx.assembly.findUnique({
          where: { id: item.assemblyId },
        });
        if (!assembly)
          throw new NotFoundException(`Assembly #${item.assemblyId} not found`);

        // Atomic guard: only decrement if enough stock remains, so concurrent
        // sales (or the same assembly listed twice) can't oversell.
        const updated = await tx.assembly.updateMany({
          where: {
            id: item.assemblyId,
            remainingQuantity: { gte: item.quantitySold },
          },
          data: { remainingQuantity: { decrement: item.quantitySold } },
        });
        if (updated.count === 0)
          throw new BadRequestException(
            `Assembly #${item.assemblyId} has only ${assembly.remainingQuantity} units remaining, need ${item.quantitySold}`,
          );
      }

      return tx.sale.create({
        data: {
          clientName: dto.clientName,
          items: {
            create: dto.items.map((i) => ({
              assemblyId: i.assemblyId,
              quantitySold: i.quantitySold,
              sellingPricePerUnit: i.sellingPricePerUnit,
            })),
          },
        },
        include: {
          items: {
            include: { assembly: { include: { assemblyTemplate: true } } },
          },
        },
      });
    });
  }
  
  async markSold(id: number) {
    await this.findOneOrThrow(id);
    return this.prisma.sale.update({
      where: { id },
      data: { soldAt: new Date() },
      include: {
        items: {
          include: { assembly: { include: { assemblyTemplate: true } } },
        },
      },
    });
  }

}
