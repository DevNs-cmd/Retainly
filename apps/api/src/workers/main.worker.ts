import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { Logger } from 'nestjs-pino';
import { WorkersModule } from './workers.module';
async function bootstrap() {
  const app = await NestFactory.createApplicationContext(WorkersModule, { bufferLogs: true });
  app.useLogger(app.get(Logger));
  app.enableShutdownHooks();
}
bootstrap().catch(() => { process.stderr.write('Worker bootstrap failed; check configuration and dependencies.\n'); process.exitCode = 1; });
