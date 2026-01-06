import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RequestContextService } from '../context/request-context.service';
import { REQUIRED_MODULE_KEY } from './module.decorator';
import { ModulesRegistryService } from './modules-registry.service';

@Injectable()
export class ModuleEnabledGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly requestContext: RequestContextService,
    private readonly modulesRegistryService: ModulesRegistryService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const requiredModule = this.reflector.getAllAndOverride<string>(REQUIRED_MODULE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredModule) {
      return true;
    }

    const tenantId =
      this.requestContext.getTenantId() || (request?.headers?.['x-tenant-id'] as string | undefined);

    if (!tenantId) {
      throw new BadRequestException('Missing x-tenant-id header');
    }

    const isEnabled = await this.modulesRegistryService.isModuleEnabled(tenantId, requiredModule);

    if (!isEnabled) {
      throw new ForbiddenException('Module not enabled for tenant');
    }

    return true;
  }
}
