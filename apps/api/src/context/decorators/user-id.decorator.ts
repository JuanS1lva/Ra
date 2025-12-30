import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { requestContextStorage } from '../request-context.storage';

export const UserId = createParamDecorator(
  (_data: unknown, _ctx: ExecutionContext) => {
    return requestContextStorage.getStore()?.userId;
  },
);
