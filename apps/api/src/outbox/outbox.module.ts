import { Module } from '@nestjs/common';
import { OutboxRepository } from './outbox.repository';
import { OutboxService } from './outbox.service';
import { OutboxPublisher } from './outbox.publisher';

// OutboxPublisher uses @Cron — ScheduleModule.forRoot() must be registered
// somewhere in the same application context (AppModule and WorkersModule both do this).
@Module({
  providers: [OutboxRepository, OutboxService, OutboxPublisher],
  exports: [OutboxService, OutboxRepository],
})
export class OutboxModule {}
