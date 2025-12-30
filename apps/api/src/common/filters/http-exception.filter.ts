import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest<{ correlationId?: string; headers?: Record<string, unknown> }>();

    const correlationId = request?.correlationId;

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      const message =
        typeof exceptionResponse === 'string'
          ? exceptionResponse
          : (exceptionResponse as any)?.message || exception.message;

      const details =
        exceptionResponse && typeof exceptionResponse === 'object'
          ? this.extractDetails(exceptionResponse)
          : undefined;

      return response.status(status).json({
        code: HttpStatus[status],
        message,
        ...(details ? { details } : {}),
        ...(correlationId ? { correlationId } : {}),
      });
    }

    return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      code: HttpStatus[HttpStatus.INTERNAL_SERVER_ERROR],
      message: 'Internal server error',
      ...(correlationId ? { correlationId } : {}),
    });
  }

  private extractDetails(response: unknown) {
    if (!response || typeof response !== 'object' || Array.isArray(response)) {
      return undefined;
    }

    const { message, ...rest } = response as Record<string, unknown>;

    return Object.keys(rest).length ? rest : undefined;
  }
}
