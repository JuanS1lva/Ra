import { Inject, Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';
import { RequestContext } from './request-context.interface';
import { REQUEST_CONTEXT_STORAGE } from './request-context.storage';

@Injectable()
export class RequestContextService {
  constructor(
    @Inject(REQUEST_CONTEXT_STORAGE)
    private readonly storage: AsyncLocalStorage<RequestContext>,
  ) {}

  run(context: RequestContext, callback: () => void) {
    this.storage.run(context, callback);
  }

  getStore() {
    return this.storage.getStore();
  }

  getTenantId() {
    return this.storage.getStore()?.tenantId;
  }

  getUserId() {
    return this.storage.getStore()?.userId;
  }
}
