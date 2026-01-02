import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../database/prisma/prisma.service';
import { RequestContextService } from '../context/request-context.service';
import { REQUIRE_PERMISSIONS_KEY } from './require-permissions.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly requestContext: RequestContextService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      REQUIRE_PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const tenantId = this.requestContext.getTenantId();
    const userId = this.requestContext.getUserId();

    if (!tenantId || !userId) {
      throw new ForbiddenException('Forbidden');
    }

    const user = await this.prisma.user.findFirst({
      where: { id: userId, tenantId, deletedAt: null },
      include: {
        roles: {
          where: { deletedAt: null, role: { deletedAt: null } },
          include: {
            role: {
              include: {
                permissions: {
                  where: { deletedAt: null, permission: { deletedAt: null } },
                  include: { permission: true },
                },
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new ForbiddenException('Forbidden');
    }

    const permissionSet = new Set<string>();

    for (const relation of user.roles) {
      for (const rolePermission of relation.role.permissions) {
        if (rolePermission.permission) {
          permissionSet.add(rolePermission.permission.code);
        }
      }
    }

    const hasAllPermissions = requiredPermissions.every((permission) =>
      permissionSet.has(permission),
    );

    if (!hasAllPermissions) {
      throw new ForbiddenException('Forbidden');
    }

    return true;
  }
}
