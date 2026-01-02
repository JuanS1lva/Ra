import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { TenantsService } from './tenants.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { TenantGuard } from '../context/tenant.guard';
import { TenantId } from '../context/decorators/tenant-id.decorator';
import { RequirePermissions } from '../rbac/require-permissions.decorator';
import { PermissionsGuard } from '../rbac/permissions.guard';

@Controller('tenants')
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Post()
  async createTenant(@Body() createTenantDto: CreateTenantDto) {
    const tenant = await this.tenantsService.create(createTenantDto);

    return { tenant };
  }

  @UseGuards(TenantGuard, PermissionsGuard)
  @RequirePermissions(['TENANT_READ'])
  @Get('me')
  async getTenant(@TenantId() tenantId: string) {
    const tenant = await this.tenantsService.findById(tenantId);

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    return { tenant };
  }

  @UseGuards(TenantGuard, PermissionsGuard)
  @RequirePermissions(['TENANT_UPDATE'])
  @Patch('me')
  async updateTenant(@TenantId() tenantId: string, @Body() updateTenantDto: UpdateTenantDto) {
    const tenant = await this.tenantsService.update(tenantId, updateTenantDto);

    return { tenant };
  }

  @UseGuards(TenantGuard, PermissionsGuard)
  @RequirePermissions(['TENANT_UPDATE'])
  @Delete('me')
  async deleteTenant(@TenantId() tenantId: string) {
    const tenant = await this.tenantsService.softDelete(tenantId);

    return { tenant };
  }

  @Post(':id/bootstrap-admin')
  async bootstrapAdmin(
    @Param('id') tenantId: string,
    @Body() createUserDto: CreateUserDto,
  ) {
    const user = await this.tenantsService.bootstrapAdminUser(
      tenantId,
      createUserDto,
    );

    return { user };
  }

  // Convenience alias to avoid ordering mistakes in the path
  @Post('bootstrap-admin/:id')
  async bootstrapAdminAlias(
    @Param('id') tenantId: string,
    @Body() createUserDto: CreateUserDto,
  ) {
    return this.bootstrapAdmin(tenantId, createUserDto);
  }
}
