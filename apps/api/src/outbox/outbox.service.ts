import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { OutboxEventDto, OutboxRepository } from './outbox.repository';
@Injectable()
export class OutboxService {
  constructor(private readonly repository: OutboxRepository) {}
  create(event: OutboxEventDto, tx: Prisma.TransactionClient) { return this.repository.create(event, tx); }
}
