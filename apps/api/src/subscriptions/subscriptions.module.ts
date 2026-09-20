import { OutboxModule } from '../outbox/outbox.module';
import { Module } from '@nestjs/common';
import { SubscriptionsRepository } from './subscriptions.repository';
import { SubscriptionsService } from './subscriptions.service';
import { SubscriptionsController } from './subscriptions.controller';
@Module({ imports:[OutboxModule],providers: [SubscriptionsRepository, SubscriptionsService], controllers: [SubscriptionsController], exports: [SubscriptionsService] })
export class SubscriptionsModule {}

