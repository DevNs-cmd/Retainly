import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { OutboxService } from '../outbox/outbox.service';
import { OutboxEventDto } from '../outbox/outbox.repository';
@Injectable()
export class EventPublisher {
  constructor(private readonly outbox: OutboxService) {}
  publish(event: OutboxEventDto, tx: Prisma.TransactionClient) { return this.outbox.create(event, tx); }
}
