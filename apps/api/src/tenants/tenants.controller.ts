import { Body, Controller, Get, NotFoundException, Patch, Post, UseGuards } from '@nestjs/common';
import { TenantsService } from './tenants.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { TenantGuard } from '../context/tenant.guard';
import { TenantId } from '../context/decorators/tenant-id.decorator';

@Controller('tenants')
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Post()
  async createTenant(@Body() createTenantDto: CreateTenantDto) {
    const tenant = await this.tenantsService.create(createTenantDto);

    return { tenant };
  }

  @UseGuards(TenantGuard)
  @Get('me')
  async getTenant(@TenantId() tenantId: string) {
    const tenant = await this.tenantsService.findById(tenantId);

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    return { tenant };
  }

  @UseGuards(TenantGuard)
  @Patch('me')
  async updateTenant(@TenantId() tenantId: string, @Body() updateTenantDto: UpdateTenantDto) {
    const tenant = await this.tenantsService.update(tenantId, updateTenantDto);

    return { tenant };
  }
}
