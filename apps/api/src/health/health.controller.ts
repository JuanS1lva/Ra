import { Controller, Get } from '@nestjs/common';

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
}
