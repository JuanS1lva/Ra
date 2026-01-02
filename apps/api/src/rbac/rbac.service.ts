import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../database/prisma/prisma.service';
import { PERMISSIONS } from './permissions.constants';
import { CreateRoleDto } from './dto/create-role.dto';

@Injectable()
export class RbacService {
  constructor(private readonly prisma: PrismaService) {}

  async syncPermissionCatalog() {
    const upserts = PERMISSIONS.map((permission) =>
      this.prisma.permission.upsert({
        where: { code: permission.code },
        update: { description: permission.description, deletedAt: null },
        create: permission,
      }),
    );

    await this.prisma.$transaction(upserts);
  }

  async listPermissions() {
    return this.prisma.permission.findMany({
      where: { deletedAt: null },
      orderBy: { code: 'asc' },
    });
  }

  async createRole(tenantId: string, createRoleDto: CreateRoleDto) {
    try {
      return await this.prisma.role.create({
        data: {
          name: createRoleDto.name,
          tenantId,
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('Role name already exists for this tenant');
      }

      throw error;
    }
  }

  async listRoles(tenantId: string) {
    return this.prisma.role.findMany({
      where: { tenantId, deletedAt: null },
      include: {
        permissions: {
          where: { deletedAt: null },
          include: { permission: true },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async assignPermissionsToRole(roleId: string, tenantId: string, permissionCodes: string[]) {
    const role = await this.prisma.role.findFirst({
      where: { id: roleId, tenantId, deletedAt: null },
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    const permissions = await this.prisma.permission.findMany({
      where: { code: { in: permissionCodes }, deletedAt: null },
    });

    if (permissions.length !== permissionCodes.length) {
      throw new NotFoundException('One or more permissions were not found');
    }

    const desiredPermissionIds = new Set(permissions.map((permission) => permission.id));
    const existing = await this.prisma.rolePermission.findMany({
      where: { roleId },
    });

    const now = new Date();
    const transactions: Prisma.PrismaPromise<unknown>[] = [];

    for (const relation of existing) {
      if (!desiredPermissionIds.has(relation.permissionId) && !relation.deletedAt) {
        transactions.push(
          this.prisma.rolePermission.update({
            where: { roleId_permissionId: { roleId, permissionId: relation.permissionId } },
            data: { deletedAt: now },
          }),
        );
      }
    }

    for (const permission of permissions) {
      const relation = existing.find((item) => item.permissionId === permission.id);

      if (relation) {
        if (relation.deletedAt) {
          transactions.push(
            this.prisma.rolePermission.update({
              where: { roleId_permissionId: { roleId, permissionId: permission.id } },
              data: { deletedAt: null, tenantId },
            }),
          );
        }
      } else {
        transactions.push(
          this.prisma.rolePermission.create({
            data: {
              roleId,
              permissionId: permission.id,
              tenantId,
            },
          }),
        );
      }
    }

    if (transactions.length > 0) {
      await this.prisma.$transaction(transactions);
    }

    return this.prisma.role.findUnique({
      where: { id: roleId },
      include: {
        permissions: {
          where: { deletedAt: null },
          include: { permission: true },
        },
      },
    });
  }

  async assignRolesToUser(userId: string, tenantId: string, roleIds: string[]) {
    const user = await this.prisma.user.findFirst({
      where: { id: userId, tenantId, deletedAt: null },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const roles = await this.prisma.role.findMany({
      where: { id: { in: roleIds }, tenantId, deletedAt: null },
    });

    if (roles.length !== roleIds.length) {
      throw new NotFoundException('One or more roles were not found');
    }

    const desiredRoleIds = new Set(roles.map((role) => role.id));
    const existing = await this.prisma.userRole.findMany({ where: { userId } });

    const now = new Date();
    const transactions: Prisma.PrismaPromise<unknown>[] = [];

    for (const relation of existing) {
      if (!desiredRoleIds.has(relation.roleId) && !relation.deletedAt) {
        transactions.push(
          this.prisma.userRole.update({
            where: { userId_roleId: { roleId: relation.roleId, userId } },
            data: { deletedAt: now },
          }),
        );
      }
    }

    for (const role of roles) {
      const relation = existing.find((item) => item.roleId === role.id);

      if (relation) {
        if (relation.deletedAt) {
          transactions.push(
            this.prisma.userRole.update({
              where: { userId_roleId: { roleId: role.id, userId } },
              data: { deletedAt: null, tenantId },
            }),
          );
        }
      } else {
        transactions.push(
          this.prisma.userRole.create({
            data: {
              userId,
              roleId: role.id,
              tenantId,
            },
          }),
        );
      }
    }

    if (transactions.length > 0) {
      await this.prisma.$transaction(transactions);
    }

    return this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        roles: {
          where: { deletedAt: null },
          include: { role: true },
        },
      },
    });
  }
}
