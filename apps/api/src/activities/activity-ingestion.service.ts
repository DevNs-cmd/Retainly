import { Injectable, BadRequestException } from '@nestjs/common';
import { Prisma, StudentActivity } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { OutboxService } from '../outbox/outbox.service';
import { ActivitiesRepository } from './activities.repository';
import { CreateActivityDto } from './dto/create-activity.dto';
@Injectable()
export class ActivityIngestionService {
  constructor(private readonly prisma: PrismaService, private readonly repository: ActivitiesRepository, private readonly outbox: OutboxService) {}
  // Explicit tenant context for trusted workers; never inject an HTTP REQUEST-scoped provider into BullMQ.
  async ingest(organizationId: string, events: CreateActivityDto[], stableId?: string, transaction?: Prisma.TransactionClient) {
    if (!organizationId || !events.length || events.length > 100) throw new BadRequestException('Invalid activity batch');
    const run = async (tx: Prisma.TransactionClient) => {
      const results: StudentActivity[] = [];
      for (let index = 0; index < events.length; index++) {
        const dto = events[index];
        const student = await tx.student.findFirst({ where: { id: dto.studentId, organizationId, deletedAt: null }, select: { id: true } });
        if (!student) throw new BadRequestException('Student does not belong to this organization');
        const activity = await this.repository.create(organizationId, dto, tx, stableId ? stableId + '-' + index : undefined);
        const payload: Prisma.InputJsonObject = {
          activityId: activity.id, studentId: activity.studentId,
          activityType: activity.activityType, occurredAt: activity.occurredAt.toISOString(),
        };
        await this.outbox.create({ organizationId, eventType: 'student.activity.recorded', payload }, tx);
        if (activity.activityType === 'PAYMENT_FAILED') await this.outbox.create({ organizationId, eventType: 'payment.failed', payload }, tx);
        results.push(activity);
      }
      return results;
    };
    return transaction ? run(transaction) : this.prisma.$transaction(run);
  }
}

