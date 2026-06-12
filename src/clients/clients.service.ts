import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';

@Injectable()
export class ClientsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.client.findMany({
      where: { deletedAt: null },
    });
  }

  async findOneOrThrow(id: number) {
    const client = await this.prisma.client.findFirst({
      where: { id, deletedAt: null },
    });
    if (!client) throw new NotFoundException(`Client #${id} not found`);
    return client;
  }

  create(dto: CreateClientDto) {
    return this.prisma.client.create({ data: { name: dto.name } });
  }

  async update(id: number, dto: UpdateClientDto) {
    await this.findOneOrThrow(id);
    return this.prisma.client.update({ where: { id }, data: dto });
  }

  async softDelete(id: number) {
    await this.findOneOrThrow(id);
    return this.prisma.client.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
