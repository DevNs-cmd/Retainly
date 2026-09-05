import { Module } from '@nestjs/common';
import { OutboxRepository } from './outbox.repository';
import { OutboxService } from './outbox.service';
import { OutboxPublisher } from './outbox.publisher';

@Module({
  providers: [OutboxRepository, OutboxService, OutboxPublisher],
  exports: [OutboxService],
})
export class OutboxModule {}
