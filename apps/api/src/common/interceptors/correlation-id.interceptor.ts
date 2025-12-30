import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { randomUUID } from 'crypto';

@Injectable()
export class CorrelationIdInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const httpContext = context.switchToHttp();
    const request = httpContext.getRequest<{ correlationId?: string; headers?: Record<string, unknown> }>();
    const response = httpContext.getResponse();

    const headerCorrelationId = this.extractCorrelationId(request?.headers?.['x-correlation-id']);
    const correlationId = headerCorrelationId ?? randomUUID();

    if (request) {
      (request as any).correlationId = correlationId;
    }

    if (response?.setHeader) {
      response.setHeader('x-correlation-id', correlationId);
    }

    return next.handle();
  }

  private extractCorrelationId(value: unknown): string | undefined {
    if (!value) {
      return undefined;
    }

    if (Array.isArray(value)) {
      return value[0];
    }

    return value as string;
  }
}
