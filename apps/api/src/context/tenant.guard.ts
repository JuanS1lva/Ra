import { BadRequestException, CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { RequestContextService } from './request-context.service';

@Injectable()
export class TenantGuard implements CanActivate {
  constructor(private readonly requestContext: RequestContextService) {}

  canActivate(_context: ExecutionContext): boolean {
    const tenantId = this.requestContext.getTenantId();

    if (!tenantId) {
      throw new BadRequestException('Missing x-tenant-id header');
    }

    return true;
  }
}
