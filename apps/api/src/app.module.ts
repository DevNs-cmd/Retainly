import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { TenantModule } from './tenant/tenant.module';
import { OrganizationsModule } from './organizations/organizations.module';
import { UsersModule } from './users/users.module';
import { MembershipsModule } from './memberships/memberships.module';
import { StudentsModule } from './students/students.module';
import { CoursesModule } from './courses/courses.module';
import { EnrollmentsModule } from './enrollments/enrollments.module';
import { ActivitiesModule } from './activities/activities.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { PaymentsModule } from './payments/payments.module';
import { RiskModule } from './risk/risk.module';
import { AutomationModule } from './automation/automation.module';
import { CampaignsModule } from './campaigns/campaigns.module';
import { CoachTasksModule } from './coach-tasks/coach-tasks.module';
import { NotificationsModule } from './notifications/notifications.module';
import { IntegrationsModule } from './integrations/integrations.module';
import { WebhooksModule } from './webhooks/webhooks.module';
import { EventsModule } from './events/events.module';
import { OutboxModule } from './outbox/outbox.module';
import { QueuesModule } from './queues/queues.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { BillingModule } from './billing/billing.module';
import { UsageModule } from './usage/usage.module';
import { AuditModule } from './audit/audit.module';

@Module({
  imports: [
    AuthModule,
    TenantModule,
    OrganizationsModule,
    UsersModule,
    MembershipsModule,
    StudentsModule,
    CoursesModule,
    EnrollmentsModule,
    ActivitiesModule,
    SubscriptionsModule,
    PaymentsModule,
    RiskModule,
    AutomationModule,
    CampaignsModule,
    CoachTasksModule,
    NotificationsModule,
    IntegrationsModule,
    WebhooksModule,
    EventsModule,
    OutboxModule,
    QueuesModule,
    AnalyticsModule,
    BillingModule,
    UsageModule,
    AuditModule,
  ],
})
export class AppModule {}
