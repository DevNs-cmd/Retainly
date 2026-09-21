import { Injectable } from '@nestjs/common';
import { OutboxEvent, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
export interface OutboxEventDto { organizationId: string; eventType: string; payload: Prisma.InputJsonObject; }
@Injectable()
export class OutboxRepository {
  constructor(private readonly prisma: PrismaService) {}
  async create(event: OutboxEventDto, tx: Prisma.TransactionClient): Promise<void> {
    if (!event.organizationId) throw new Error('Outbox organizationId is required');
    await tx.outboxEvent.create({ data: event });
  }
  // The publisher alone scans across tenants. Row locks MUST remain held through enqueue + status updates.
  async withUnpublished(limit: number, visit: (events: OutboxEvent[], tx: Prisma.TransactionClient) => Promise<void>) {
    await this.prisma.$transaction(async tx => {
      const events = await tx.$queryRaw<OutboxEvent[]>`
        SELECT id, organization_id AS "organizationId", event_type AS "eventType", payload, status,
          retry_count AS "retryCount", error, created_at AS "createdAt", updated_at AS "updatedAt"
        FROM outbox_events
        WHERE status = 'PENDING' AND (retry_count = 0 OR updated_at < NOW() - INTERVAL '30 seconds')
        ORDER BY created_at LIMIT ${limit} FOR UPDATE SKIP LOCKED
      `;
      await visit(events, tx);
    }, { timeout: 30000, maxWait: 5000 });
  }
  async findUnpublished(organizationId: string, limit: number) {
    return this.prisma.outboxEvent.findMany({ where: { organizationId, status: 'PENDING' }, take: limit, orderBy: { createdAt: 'asc' } });
  }
  async markPublished(organizationId: string, ids: string[], tx: Prisma.TransactionClient) {
    await tx.outboxEvent.updateMany({ where: { organizationId, id: { in: ids }, status: 'PENDING' }, data: { status: 'PUBLISHED', error: null } });
  }
  async markFailed(event: OutboxEvent, tx: Prisma.TransactionClient) {
    await tx.outboxEvent.updateMany({
      where: { id: event.id, organizationId: event.organizationId, status: 'PENDING' },
      data: { retryCount: { increment: 1 }, error: 'Queue delivery failed', status: event.retryCount >= 9 ? 'FAILED' : 'PENDING' },
    });
  }
}
