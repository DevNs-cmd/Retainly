import { AutomationCompletionService } from '../automation/automation-completion.service';
import { MembershipsModule } from '../memberships/memberships.module';
import { Module } from '@nestjs/common';import { ScheduleModule } from '@nestjs/schedule';
import { InfrastructureModule } from '../infrastructure.module';import { ActivitiesModule } from '../activities/activities.module';import { OutboxModule } from '../outbox/outbox.module';import { OutboxPublisher } from '../outbox/outbox.publisher';import { IntegrationsModule } from '../integrations/integrations.module';import { NotificationsModule } from '../notifications/notifications.module';import { BillingModule } from '../billing/billing.module';import { RiskModule } from '../risk/risk.module';import { StudentsModule } from '../students/students.module';import { SchedulerService } from './scheduler.service';
import { WebhookIdempotencyService } from '../webhooks/idempotency/webhook-idempotency.service';import { WebhookWorker } from './webhook/webhook.worker';import { WebhookProcessor } from './webhook/webhook.processor';
import { RiskWorker } from './risk/risk.worker';import { RiskProcessor } from './risk/risk.processor';
import { AutomationWorker } from './automation/automation.worker';import { AutomationProcessor } from './automation/automation.processor';
import { NotificationWorker } from './notification/notification.worker';import { NotificationProcessor } from './notification/notification.processor';
import { SyncWorker } from './sync/sync.worker';import { SyncProcessor } from './sync/sync.processor';
import { AnalyticsWorker } from './analytics/analytics.worker';import { AnalyticsProcessor } from './analytics/analytics.processor';
import { BillingWorker } from './billing/billing.worker';import { BillingProcessor } from './billing/billing.processor';
@Module({imports:[MembershipsModule,InfrastructureModule,ScheduleModule.forRoot(),ActivitiesModule,OutboxModule,IntegrationsModule,NotificationsModule,BillingModule,RiskModule,StudentsModule],providers:[AutomationCompletionService,OutboxPublisher,SchedulerService,WebhookIdempotencyService,WebhookWorker,WebhookProcessor,RiskWorker,RiskProcessor,AutomationWorker,AutomationProcessor,NotificationWorker,NotificationProcessor,SyncWorker,SyncProcessor,AnalyticsWorker,AnalyticsProcessor,BillingWorker,BillingProcessor]})export class WorkersModule{}

