import { Global, Module } from '@nestjs/common';
import { RequestContextService } from './request-context.service';
import { REQUEST_CONTEXT_STORAGE, requestContextStorage } from './request-context.storage';
import { TenantGuard } from './tenant.guard';

@Global()
@Module({
  providers: [
    RequestContextService,
    TenantGuard,
    { provide: REQUEST_CONTEXT_STORAGE, useValue: requestContextStorage },
  ],
  exports: [RequestContextService, TenantGuard],
})
export class ContextModule {}
