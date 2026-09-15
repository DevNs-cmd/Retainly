import { ConfigService } from '@nestjs/config';
import 'reflect-metadata';
import { test } from 'node:test';
import * as assert from 'node:assert/strict';
import { Test, TestingModuleBuilder } from '@nestjs/testing';
import { getQueueToken } from '@nestjs/bullmq';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from '../../src/app.module';
import { WorkersModule } from '../../src/workers/workers.module';
import { PrismaService } from '../../src/prisma/prisma.service';
import { RedisService } from '../../src/redis/redis.module';
import { QueueNames } from '../../src/queues/queue-names';
import { WebhookWorker } from '../../src/workers/webhook/webhook.worker';
function isolated(builder: TestingModuleBuilder) {
  builder.overrideProvider(PrismaService).useValue({ $queryRaw: async () => [{ ready: 1 }] });
  builder.overrideProvider(RedisService).useValue({ ping: async () => 'PONG' });
  for (const name of Object.values(QueueNames)) builder.overrideProvider(getQueueToken(name)).useValue({ name, add: async () => ({ id: 'test' }) });
  return builder;
}
test('API dependency graph compiles and Swagger includes implemented routes', async () => {
  process.env.AUTH_ISSUER = 'https://issuer.example/';
  process.env.AUTH_AUDIENCE = 'retainly';
  process.env.PORT = '3400';
  const module = await isolated(Test.createTestingModule({ imports: [AppModule] })).compile();
  assert.equal(module.get(ConfigService).get('app.port'), 3400);
  const app = module.createNestApplication();
  try {
    app.setGlobalPrefix('api');
    await app.init();
    const docs = SwaggerModule.createDocument(app, new DocumentBuilder().setTitle('test').build());
    assert.ok(docs.paths['/api/activities'].get);
    assert.ok(docs.paths['/api/activities/batch'].post);
    assert.ok(docs.paths['/api/webhooks/{provider}'].post);
    assert.ok(docs.paths['/api/health'].get);
  } finally { await app.close(); }
});
test('worker graph compiles and webhook worker remains a singleton', async () => {
  const module = await isolated(Test.createTestingModule({ imports: [WorkersModule] })).compile();
  try { assert.ok(module.get(WebhookWorker) instanceof WebhookWorker); }
  finally { await module.close(); }
});
