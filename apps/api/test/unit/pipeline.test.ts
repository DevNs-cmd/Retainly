import 'reflect-metadata';
import { test } from 'node:test';
import * as assert from 'node:assert/strict';
import { Prisma } from '@prisma/client';
import { Queue } from 'bullmq';
import { PrismaService } from '../../src/prisma/prisma.service';
import { ActivitiesRepository } from '../../src/activities/activities.repository';
import { ActivityIngestionService } from '../../src/activities/activity-ingestion.service';
import { ActivityType } from '../../src/activities/dto/create-activity.dto';
import { OutboxService } from '../../src/outbox/outbox.service';
import { OutboxRepository } from '../../src/outbox/outbox.repository';
import { OutboxPublisher } from '../../src/outbox/outbox.publisher';
import { QueueNames } from '../../src/queues/queue-names';
import { WebhookIdempotencyService } from '../../src/webhooks/idempotency/webhook-idempotency.service';
import { RedisService } from '../../src/redis/redis.module';
import { ListActivitiesDto } from '../../src/activities/dto/list-activities.dto';

test('activity and outbox use the same transaction and an outbox failure rejects ingestion', async () => {
  const tx = { student: { findFirst: async () => ({id:'student'}) } } as unknown as Prisma.TransactionClient;
  const calls: string[] = [];
  const prisma = { $transaction: async (fn: (tx: Prisma.TransactionClient) => Promise<unknown>) => fn(tx) } as unknown as PrismaService;
  const repository = { create: async (org: string, dto: object, actualTx: object) => {
    assert.equal(org, 'org-a'); assert.equal(actualTx, tx); calls.push('activity');
    return { id: 'act', studentId: 'student', activityType: 'LOGIN', occurredAt: new Date() };
  } } as unknown as ActivitiesRepository;
  const outbox = { create: async (event: { organizationId: string }, actualTx: object) => {
    assert.equal(event.organizationId, 'org-a'); assert.equal(actualTx, tx); calls.push('outbox'); throw new Error('DB unavailable');
  } } as unknown as OutboxService;
  const service = new ActivityIngestionService(prisma, repository, outbox);
  await assert.rejects(service.ingest('org-a', [{ studentId: 'student', activityType: ActivityType.LOGIN, source: 'manual', payload: {}, occurredAt: new Date().toISOString() }]), /DB unavailable/);
  assert.deepEqual(calls, ['activity', 'outbox']);
});

test('outbox partial fanout retries stable job IDs and publishes only after every destination succeeds', async () => {
  const calls: string[] = [];
  let failAnalytics = true;
  const event = { id: 'event-a', organizationId: 'org-a', eventType: 'student.activity.recorded', payload: { studentId: 'student' }, retryCount: 0 };
  const repo = {
    withUnpublished: async (_: number, visit: Function) => visit([event], {}),
    markFailed: async () => calls.push('failed'),
    markPublished: async (org: string, ids: string[]) => { assert.equal(org, 'org-a'); assert.deepEqual(ids, ['event-a']); calls.push('published'); },
  } as unknown as OutboxRepository;
  const makeQueue = (name: string) => ({ add: async (_: string, data: object, options: { jobId: string }) => {
    assert.equal(options.jobId, 'event-a'); calls.push(name);
    if (name === QueueNames.ANALYTICS && failAnalytics) throw new Error('Redis unavailable');
  } }) as unknown as Queue;
  const publisher = new OutboxPublisher(repo, makeQueue(QueueNames.RISK), makeQueue(QueueNames.ANALYTICS), makeQueue(QueueNames.AUTOMATION), makeQueue(QueueNames.NOTIFICATION), makeQueue(QueueNames.BILLING));
  await publisher.publishPendingEvents();
  assert.deepEqual(calls, [QueueNames.RISK, QueueNames.ANALYTICS, 'failed']);
  calls.length = 0; failAnalytics = false;
  await publisher.publishPendingEvents();
  assert.deepEqual(calls, [QueueNames.RISK, QueueNames.ANALYTICS, 'published']);
});

test('activity list applies tenant filters to both rows and count', async () => {
  const filters: unknown[] = [];
  const prisma = { studentActivity: {
    findMany: (args: { where: unknown }) => { filters.push(args.where); return Promise.resolve([]); },
    count: (args: { where: unknown }) => { filters.push(args.where); return Promise.resolve(0); },
  }, $transaction: (queries: Promise<unknown>[]) => Promise.all(queries) } as unknown as PrismaService;
  await new ActivitiesRepository(prisma).list('org-b', Object.assign(new ListActivitiesDto(), { studentId: 'student-a' }));
  assert.equal(filters.length, 2);
  for (const filter of filters) assert.deepEqual(filter, { organizationId: 'org-b', studentId: 'student-a', activityType: undefined });
});

test('Redis idempotency uses tenant/provider/event keys, SET NX and 24-hour processed TTL', async () => {
  const calls: unknown[][] = [];
  const redis = { set: async (...args: unknown[]) => { calls.push(args); return 'OK'; } } as unknown as RedisService;
  const service = new WebhookIdempotencyService(redis);
  const key = service.key('org-a', 'stripe', 'event');
  assert.notEqual(key, service.key('org-b', 'stripe', 'event'));
  assert.notEqual(key, service.key('org-a', 'kajabi', 'event'));
  assert.ok(await service.acquire(key));
  assert.deepEqual(calls[0].slice(2), ['EX', 300, 'NX']);
  await service.markProcessed(key);
  assert.deepEqual(calls[1], [key, 'processed', 'EX', 86400]);
});
