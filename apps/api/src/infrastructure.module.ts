import { DatabaseModule } from './data/database.service';
import { TenantCacheModule } from './common/cache/tenant-cache.service';
import { TenantModule } from './tenant/tenant.module';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { appConfig } from './config/app.config';
import { databaseConfig } from './config/database.config';
import { queueConfig } from './config/queue.config';
import { redisConfig } from './config/redis.config';
import { PrismaModule } from './prisma/prisma.module';
import { RedisModule } from './redis/redis.module';
import { QueuesModule } from './queues/queues.module';
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [appConfig, databaseConfig, queueConfig, redisConfig] }),
    LoggerModule.forRoot({ pinoHttp: { autoLogging: false, redact: ['req.headers.authorization', 'req.headers.cookie', 'req.body', 'res.headers.set-cookie'] } }),
    PrismaModule, RedisModule, QueuesModule, DatabaseModule, TenantCacheModule, TenantModule,
  ],
  exports: [PrismaModule, RedisModule, QueuesModule],
})
export class InfrastructureModule {}

