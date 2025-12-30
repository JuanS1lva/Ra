import { Controller, Get, UseGuards } from '@nestjs/common';
import { TenantGuard } from '../context/tenant.guard';
import { TenantId } from '../context/decorators/tenant-id.decorator';
import { UserId } from '../context/decorators/user-id.decorator';

@Controller()
export class HealthController {
  @Get('health')
  getHealth() {
    return {
      status: 'ok',
      service: 'api',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('ready')
  async getReady() {
    // TODO: Validate Prisma connectivity when Prisma client is available.
    return {
      status: 'ok',
      service: 'api',
      ready: true,
      timestamp: new Date().toISOString(),
      note: 'TODO: Replace with Prisma readiness check',
    };
  }

  @UseGuards(TenantGuard)
  @Get('context')
  getRequestContext(
    @TenantId() tenantId: string,
    @UserId() userId?: string,
  ) {
    return {
      tenantId,
      userId,
      note: 'Example endpoint using request context',
    };
  }
}
