import { Global, Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigService } from '@nestjs/config';
import { QueueNames } from './queue-names';
import { QUEUE_OPTIONS } from './queue.config';
@Global()
@Module({
  imports: [
    BullModule.forRootAsync({ inject: [ConfigService], useFactory: (config: ConfigService) => {
      const url = new URL(config.get<string>('REDIS_URL') || 'redis://localhost:6379');
      return { prefix: 'retainly:queue', connection: {
        host: url.hostname, port: Number(url.port || 6379),
        username: url.username ? decodeURIComponent(url.username) : undefined,
        password: url.password ? decodeURIComponent(url.password) : undefined,
        db: Number(url.pathname.slice(1) || 0),
        tls: url.protocol === 'rediss:' ? {} : undefined,
        maxRetriesPerRequest: null,
      } };
    } }),
    BullModule.registerQueue(...Object.values(QueueNames).map(name => ({ name, ...QUEUE_OPTIONS }))),
  ],
  exports: [BullModule],
})
export class QueuesModule {}
