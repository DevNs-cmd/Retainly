import { Module } from '@nestjs/common';
import { EventPublisher } from './event-publisher';
import { OutboxModule } from '../outbox/outbox.module';
@Module({ imports: [OutboxModule], providers: [EventPublisher], exports: [EventPublisher] })
export class EventsModule {}
