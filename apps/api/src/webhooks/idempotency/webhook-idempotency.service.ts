import { Injectable } from '@nestjs/common';
import { createHash, randomUUID } from 'node:crypto';
import { RedisService } from '../../redis/redis.module';
@Injectable()
export class WebhookIdempotencyService {
  constructor(private readonly redis: RedisService) {}
  key(organizationId: string, provider: string, eventId: string) {
    return 'webhook:' + createHash('sha256').update(JSON.stringify([organizationId, provider, eventId])).digest('hex');
  }
  async acquire(key: string): Promise<string | null> {
    const token = randomUUID();
    return await this.redis.set(key, token, 'EX', 300, 'NX') === 'OK' ? token : null;
  }
  async isProcessed(key: string) { return await this.redis.get(key) === 'processed'; }
  async markProcessed(key: string) { await this.redis.set(key, 'processed', 'EX', 86400); }
  async release(key: string, token: string) {
    await this.redis.eval("if redis.call('GET', KEYS[1]) == ARGV[1] then return redis.call('DEL', KEYS[1]) else return 0 end", 1, key, token);
  }
}
