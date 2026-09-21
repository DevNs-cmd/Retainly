import { Global, Module, Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService extends Redis implements OnModuleDestroy {
  constructor(config: ConfigService) {
    super(config.get<string>('REDIS_URL') || 'redis://localhost:6379', {
      maxRetriesPerRequest: 2, connectTimeout: 5000,
    });
  }
  async onModuleDestroy() { await this.quit(); }
}
@Global()
@Module({ providers: [RedisService], exports: [RedisService] })
export class RedisModule {}
