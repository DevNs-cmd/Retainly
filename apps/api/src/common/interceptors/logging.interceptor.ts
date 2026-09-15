import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common';
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');
  intercept(context: ExecutionContext, next: CallHandler) {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const started = Date.now();
    // Log after exception filters have set the final status, rather than during RxJS teardown.
    response.once('finish', () => this.logger.log({
      method: request.method, path: request.path, statusCode: response.statusCode,
      duration: Date.now() - started, userId: request.user?.userId,
      organizationId: request.user?.organizationId,
    }));
    return next.handle();
  }
}
