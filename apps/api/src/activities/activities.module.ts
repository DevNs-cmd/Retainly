import { TenantModule } from '../tenant/tenant.module';
import { Module } from '@nestjs/common';
import { OutboxModule } from '../outbox/outbox.module';
import { ActivitiesController } from './activities.controller';
import { ActivitiesService } from './activities.service';
import { ActivitiesRepository } from './activities.repository';
import { ActivityIngestionService } from './activity-ingestion.service';
@Module({
  imports: [TenantModule, OutboxModule], controllers: [ActivitiesController],
  providers: [ActivitiesService, ActivitiesRepository, ActivityIngestionService],
  exports: [ActivitiesService, ActivityIngestionService],
})
export class ActivitiesModule {}
