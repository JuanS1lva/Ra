import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma/prisma.service';
import { TenantStatus } from '@prisma/client';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';

@Injectable()
export class TenantsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createTenantDto: CreateTenantDto) {
    return this.prisma.tenant.create({
      data: {
        name: createTenantDto.name,
        status: TenantStatus.ACTIVE,
      },
    });
  }

  async findById(id: string) {
    return this.prisma.tenant.findFirst({ where: { id, deletedAt: null } });
  }

  async update(id: string, updateTenantDto: UpdateTenantDto) {
    const existing = await this.findById(id);

    if (!existing) {
      throw new NotFoundException('Tenant not found');
    }

    return this.prisma.tenant.update({
      where: { id },
      data: updateTenantDto,
    });
  }

  async softDelete(id: string) {
    const existing = await this.findById(id);

    if (!existing) {
      throw new NotFoundException('Tenant not found');
    }

    return this.prisma.tenant.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
