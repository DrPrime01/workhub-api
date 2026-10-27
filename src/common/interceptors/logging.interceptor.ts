import {
  CallHandler,
  ExecutionContext,
  HttpException,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, catchError, tap, throwError } from 'rxjs';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<unknown> {
    const http = context.switchToHttp();
    const request = http.getRequest();
    const response = http.getResponse();

    const startedAt = Date.now();

    const path =
      request.route?.path ??
      request.path ??
      request.url?.split('?')[0] ??
      'unknown';

    return next.handle().pipe(
      tap(() => {
        this.writeLog({
          level: 'info',
          method: request.method,
          path,
          statusCode: response.statusCode,
          durationMs: Date.now() - startedAt,
        });
      }),
      catchError((error: unknown) => {
        this.writeLog({
          level: 'error',
          method: request.method,
          path,
          statusCode: error instanceof HttpException ? error.getStatus() : 500,
          durationMs: Date.now() - startedAt,
        });

        return throwError(() => error);
      }),
    );
  }

  private writeLog(entry: Record<string, unknown>): void {
    const structuredEntry = {
      timeStamp: new Date().toISOString(),
      ...entry,
    };

    const message = JSON.stringify(structuredEntry);

    if (entry.level === 'error') this.logger.error(message);
    else this.logger.log(message);
  }
}
