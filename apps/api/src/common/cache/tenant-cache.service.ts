import { Global, Injectable, Module } from '@nestjs/common';
import { createHash } from 'node:crypto';
import { RedisService } from '../../redis/redis.module';
@Injectable()
export class TenantCache {
 constructor(private readonly redis: RedisService) {}
 private versionKey(org: string) { return 'cache-version:' + org; }
 async remember<T>(org: string, resource: string, query: unknown, ttl: number, read: () => Promise<T>): Promise<T> {
   const version = await this.redis.get(this.versionKey(org)) || '0';
   const key = 'cache:' + org + ':' + version + ':' + resource + ':' + createHash('sha256').update(JSON.stringify(query)).digest('hex');
   const cached = await this.redis.get(key);
   if (cached) return JSON.parse(cached) as T;
   const result = await read();
   await this.redis.set(key, JSON.stringify(result), 'EX', ttl);
   return result;
 }
 async invalidate(org: string) { await this.redis.incr(this.versionKey(org)); }
}
@Global() @Module({ providers: [TenantCache], exports: [TenantCache] })
export class TenantCacheModule {}

