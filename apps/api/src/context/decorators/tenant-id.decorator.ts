import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { requestContextStorage } from '../request-context.storage';

export const TenantId = createParamDecorator(
  (_data: unknown, _ctx: ExecutionContext) => {
    return requestContextStorage.getStore()?.tenantId;
  },
);
