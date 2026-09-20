import 'reflect-metadata';
import { test } from 'node:test';
import * as assert from 'node:assert/strict';
import { ValidationPipe } from '@nestjs/common';
import { BatchActivityDto, CreateActivityDto } from '../../src/activities/dto/create-activity.dto';
import { ListActivitiesDto } from '../../src/activities/dto/list-activities.dto';
const pipe = new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true });
test('HTTP validation rejects tenant injection, invalid statuses and oversized batches', async () => {
  const valid = { studentId: 'student', activityType: 'LOGIN', source: 'manual', payload: {}, occurredAt: '2026-09-10T10:00:00Z' };
  await assert.rejects(pipe.transform({ ...valid, organizationId: 'other' }, { type: 'body', metatype: CreateActivityDto }));
  await assert.rejects(pipe.transform({ ...valid, activityType: 'MADE_UP' }, { type: 'body', metatype: CreateActivityDto }));
  await assert.rejects(pipe.transform({ events: Array(101).fill(valid) }, { type: 'body', metatype: BatchActivityDto }));
  await assert.rejects(pipe.transform({ events: [{ ...valid, studentId: '' }] }, { type: 'body', metatype: BatchActivityDto }));
});
test('pagination transforms query strings and bounds limits and sort fields', async () => {
  const query = await pipe.transform({ page: '2', limit: '10' }, { type: 'query', metatype: ListActivitiesDto });
  assert.equal(query.skip, 10);
  await assert.rejects(pipe.transform({ limit: '10000' }, { type: 'query', metatype: ListActivitiesDto }));
  await assert.rejects(pipe.transform({ sortBy: 'organizationId' }, { type: 'query', metatype: ListActivitiesDto }));
});
