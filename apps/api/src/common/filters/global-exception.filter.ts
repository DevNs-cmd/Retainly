import { ArgumentsHost, Catch, ExceptionFilter, HttpException, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);
  catch(error: unknown, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse();
    let status = 500;
    let message: string | string[] = 'Internal server error';
    if (error instanceof HttpException) {
      status = error.getStatus();
      const body = error.getResponse();
      message = typeof body === 'string' ? body : (body as { message?: string | string[] }).message || error.message;
    } else if (error instanceof Prisma.PrismaClientKnownRequestError) {
      const mapped: Record<string, [number, string]> = {
        P2021: [503, 'Database contract is not deployed'], P2022: [503, 'Database contract is not deployed'],
        P2002: [409, 'Resource already exists'], P2003: [400, 'Invalid related resource'],
        P2025: [404, 'Resource not found'], P2034: [409, 'Concurrent update; retry the request'],
      };
      [status, message] = mapped[error.code] || [500, 'Database operation failed'];
    }
    if (error instanceof Prisma.PrismaClientValidationError) { status = 503; message = 'Database client does not match the API contract'; }
    if (status >= 500) this.logger.error({ errorType: error instanceof Error ? error.name : 'UnknownError', status }, 'Request failed');
    response.status(status).json({ statusCode: status, message });
  }
}

