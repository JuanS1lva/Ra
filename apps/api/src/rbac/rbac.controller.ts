import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { RbacService } from './rbac.service';
import { TenantGuard } from '../context/tenant.guard';
import { TenantId } from '../context/decorators/tenant-id.decorator';
import { CreateRoleDto } from './dto/create-role.dto';
import { AssignPermissionsDto } from './dto/assign-permissions.dto';
import { AssignRolesDto } from './dto/assign-roles.dto';
import { PermissionsGuard } from './permissions.guard';
import { RequirePermissions } from './require-permissions.decorator';

@UseGuards(TenantGuard, PermissionsGuard)
@Controller()
export class RbacController {
  constructor(private readonly rbacService: RbacService) {}

  @Get('permissions')
  @RequirePermissions(['ROLE_READ'])
  async listPermissions() {
    const permissions = await this.rbacService.listPermissions();

    return { permissions };
  }

  @Post('roles')
  @RequirePermissions(['ROLE_CREATE'])
  async createRole(@TenantId() tenantId: string, @Body() createRoleDto: CreateRoleDto) {
    const role = await this.rbacService.createRole(tenantId, createRoleDto);

    return { role };
  }

  @Get('roles')
  @RequirePermissions(['ROLE_READ'])
  async listRoles(@TenantId() tenantId: string) {
    const roles = await this.rbacService.listRoles(tenantId);

    return { roles };
  }

  @Post('roles/:id/permissions')
  @RequirePermissions(['PERMISSION_ASSIGN'])
  async assignPermissions(
    @Param('id') roleId: string,
    @TenantId() tenantId: string,
    @Body() { permissionCodes }: AssignPermissionsDto,
  ) {
    const role = await this.rbacService.assignPermissionsToRole(roleId, tenantId, permissionCodes);

    return { role };
  }

  @Post('users/:id/roles')
  @RequirePermissions(['ROLE_ASSIGN'])
  async assignRoles(
    @Param('id') userId: string,
    @TenantId() tenantId: string,
    @Body() { roleIds }: AssignRolesDto,
  ) {
    const user = await this.rbacService.assignRolesToUser(userId, tenantId, roleIds);

    return { user };
  }
}
