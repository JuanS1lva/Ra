import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { RbacService } from './rbac.service';
import { TenantGuard } from '../context/tenant.guard';
import { TenantId } from '../context/decorators/tenant-id.decorator';
import { CreateRoleDto } from './dto/create-role.dto';
import { AssignPermissionsDto } from './dto/assign-permissions.dto';
import { AssignRolesDto } from './dto/assign-roles.dto';

@UseGuards(TenantGuard)
@Controller()
export class RbacController {
  constructor(private readonly rbacService: RbacService) {}

  @Get('permissions')
  async listPermissions() {
    const permissions = await this.rbacService.listPermissions();

    return { permissions };
  }

  @Post('roles')
  async createRole(@TenantId() tenantId: string, @Body() createRoleDto: CreateRoleDto) {
    const role = await this.rbacService.createRole(tenantId, createRoleDto);

    return { role };
  }

  @Get('roles')
  async listRoles(@TenantId() tenantId: string) {
    const roles = await this.rbacService.listRoles(tenantId);

    return { roles };
  }

  @Post('roles/:id/permissions')
  async assignPermissions(
    @Param('id') roleId: string,
    @TenantId() tenantId: string,
    @Body() { permissionCodes }: AssignPermissionsDto,
  ) {
    const role = await this.rbacService.assignPermissionsToRole(roleId, tenantId, permissionCodes);

    return { role };
  }

  @Post('users/:id/roles')
  async assignRoles(
    @Param('id') userId: string,
    @TenantId() tenantId: string,
    @Body() { roleIds }: AssignRolesDto,
  ) {
    const user = await this.rbacService.assignRolesToUser(userId, tenantId, roleIds);

    return { user };
  }
}
