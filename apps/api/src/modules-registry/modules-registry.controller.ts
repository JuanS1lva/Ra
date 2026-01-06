import { Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ModulesRegistryService } from './modules-registry.service';
import { TenantGuard } from '../context/tenant.guard';
import { TenantId } from '../context/decorators/tenant-id.decorator';

@UseGuards(TenantGuard)
@Controller('modules')
export class ModulesRegistryController {
  constructor(private readonly modulesRegistryService: ModulesRegistryService) {}

  @Get()
  async getModules(@TenantId() tenantId: string) {
    const { tenantStatus, modules } = await this.modulesRegistryService.listModules(tenantId);

    return { tenantStatus, modules };
  }

  @Post(':moduleId/enable')
  async enableModule(@TenantId() tenantId: string, @Param('moduleId') moduleId: string) {
    const subscription = await this.modulesRegistryService.enableModule(tenantId, moduleId);

    return { subscription };
  }

  @Post(':moduleId/disable')
  async disableModule(@TenantId() tenantId: string, @Param('moduleId') moduleId: string) {
    const subscription = await this.modulesRegistryService.disableModule(tenantId, moduleId);

    return { subscription };
  }
}
