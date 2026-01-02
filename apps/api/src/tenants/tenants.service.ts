import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma/prisma.service';
import { TenantStatus } from '@prisma/client';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';

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

  async bootstrapAdminUser(tenantId: string, createUserDto: CreateUserDto) {
    const tenant = await this.findById(tenantId);

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    const activeUsers = await this.prisma.user.count({
      where: { tenantId, deletedAt: null },
    });

    if (activeUsers > 0) {
      throw new ConflictException('Tenant already has active users');
    }

    const permissions = await this.prisma.permission.findMany({
      where: { deletedAt: null },
    });

    if (permissions.length === 0) {
      throw new NotFoundException('No permissions available to assign');
    }

    const roleName = 'Tenant Admin';

    const user = await this.prisma.$transaction(async (tx) => {
      const createdUser = await tx.user.upsert({
        where: {
          tenantId_email: { tenantId, email: createUserDto.email },
        },
        update: { name: createUserDto.name, deletedAt: null, isActive: true },
        create: {
          tenantId,
          email: createUserDto.email,
          name: createUserDto.name,
        },
      });

      const role = await tx.role.upsert({
        where: { tenantId_name: { tenantId, name: roleName } },
        update: { deletedAt: null },
        create: { tenantId, name: roleName },
      });

      await Promise.all(
        permissions.map((permission) =>
          tx.rolePermission.upsert({
            where: {
              roleId_permissionId: { roleId: role.id, permissionId: permission.id },
            },
            update: { deletedAt: null, tenantId },
            create: { roleId: role.id, permissionId: permission.id, tenantId },
          }),
        ),
      );

      await tx.userRole.upsert({
        where: { userId_roleId: { userId: createdUser.id, roleId: role.id } },
        update: { deletedAt: null, tenantId },
        create: { userId: createdUser.id, roleId: role.id, tenantId },
      });

      return tx.user.findUnique({
        where: { id: createdUser.id },
        include: {
          roles: {
            where: { deletedAt: null },
            include: {
              role: {
                include: {
                  permissions: {
                    where: { deletedAt: null },
                    include: { permission: true },
                  },
                },
              },
            },
          },
        },
      });
    });

    return user;
  }
}
