import { BadRequestException, CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { RequestContextService } from './request-context.service';

@Injectable()
export class TenantGuard implements CanActivate {
  constructor(private readonly requestContext: RequestContextService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const tenantId =
      this.requestContext.getTenantId() || (request?.headers?.['x-tenant-id'] as string | undefined);

    if (!tenantId) {
      throw new BadRequestException('Missing x-tenant-id header');
    }

    return true;
  }
}
