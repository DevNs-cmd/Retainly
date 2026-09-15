import { Module } from '@nestjs/common';
import { SubscriptionsRepository } from './subscriptions.repository';
import { SubscriptionsService } from './subscriptions.service';
import { SubscriptionsController } from './subscriptions.controller';
@Module({ providers: [SubscriptionsRepository, SubscriptionsService], controllers: [SubscriptionsController], exports: [SubscriptionsService] })
export class SubscriptionsModule {}

