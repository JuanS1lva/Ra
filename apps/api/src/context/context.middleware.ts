import { Injectable, NestMiddleware } from '@nestjs/common';
import { RequestContext } from './request-context.interface';
import { RequestContextService } from './request-context.service';

@Injectable()
export class ContextMiddleware implements NestMiddleware {
  constructor(private readonly requestContext: RequestContextService) {}

  use(req: Record<string, any>, _res: unknown, next: () => void) {
    const tenantId = req.headers?.['x-tenant-id'] as string | undefined;
    const userId = req.headers?.['x-user-id'] as string | undefined;

    const context: RequestContext = { tenantId, userId };

    this.requestContext.run(context, () => next());
  }
}
