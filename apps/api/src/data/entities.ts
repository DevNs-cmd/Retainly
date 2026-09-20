import { Role } from '../auth/auth.types';
export type Json = Record<string, unknown>;
export enum PlanTier { STARTER='STARTER', GROWTH='GROWTH', PRO='PRO', AGENCY='AGENCY' }
export enum Segment { HIGH_RISK='HIGH_RISK', MEDIUM_RISK='MEDIUM_RISK', LOW_RISK='LOW_RISK', CHAMPION='CHAMPION' }
export enum EnrollmentStatus { ACTIVE='ACTIVE', COMPLETED='COMPLETED', PAUSED='PAUSED', CANCELLED='CANCELLED', EXPIRED='EXPIRED' }
export enum TaskStatus { PENDING='PENDING', IN_PROGRESS='IN_PROGRESS', DONE='DONE', SNOOZED='SNOOZED' }
export enum CampaignStatus { DRAFT='DRAFT', SCHEDULED='SCHEDULED', RUNNING='RUNNING', PAUSED='PAUSED', COMPLETED='COMPLETED' }
export enum Channel { EMAIL='EMAIL', SMS='SMS', MIXED='MIXED' }
export enum TriggerType { RISK_SCORE_ABOVE='RISK_SCORE_ABOVE', RISK_SCORE_CHANGE='RISK_SCORE_CHANGE', INACTIVITY_DAYS='INACTIVITY_DAYS', ENROLLMENT_STATUS='ENROLLMENT_STATUS', PAYMENT_FAILED='PAYMENT_FAILED', MANUAL='MANUAL' }
export enum ActionType { SEND_EMAIL='SEND_EMAIL', SEND_SMS='SEND_SMS', SEND_SLACK='SEND_SLACK', ADD_TO_CAMPAIGN='ADD_TO_CAMPAIGN', ASSIGN_COACH_TASK='ASSIGN_COACH_TASK', MARK_REVIEWED='MARK_REVIEWED', WEBHOOK='WEBHOOK' }
export interface Row { id: string; organizationId: string; createdAt: Date; updatedAt: Date; }
export interface SoftRow extends Row { deletedAt: Date | null; }
export interface Organization extends Row { name: string; logo: string | null; timezone: string; planTier: PlanTier; stripeCustomerId: string | null; deletedAt: Date | null; }
export interface User extends Row { name: string; email: string; avatar: string | null; }
export interface Membership extends SoftRow { userId: string | null; role: Role; invitationEmail: string | null; invitationStatus: string; }
export interface Student extends SoftRow { emailOptOut: boolean; name: string; email: string; phone: string | null; provider: string | null; externalId: string | null; assignedCoachId: string | null; segment: Segment | null; riskScore: number | null; reviewedAt: Date | null; }
export interface Course extends SoftRow { name: string; description: string | null; provider: string | null; externalId: string | null; integrationConnectionId: string | null; }
export interface Enrollment extends SoftRow { studentId: string; courseId: string; status: EnrollmentStatus; completionPercent: number; externalId: string | null; provider: string | null; }
export interface RiskSnapshot extends Row { studentId: string; score: number; reasons: string[]; confidence: number; segment: Segment; sourceEventId: string; calculatedAt: Date; }
export interface Trigger { type: TriggerType; conditions: { threshold?: number; delta?: number; days?: number; status?: EnrollmentStatus }; }
export interface Action { type: ActionType; config: { templateId?: string; message?: string; channelId?: string; campaignId?: string; coachId?: string; title?: string; endpointKey?: string; }; }
export interface AutomationRule extends SoftRow { name: string; trigger: Trigger; actions: Action[]; cooldownHours: number; isActive: boolean; }
export interface AutomationExecution extends Row { ruleId: string; studentId: string; sourceEventId: string; status: string; executedAt: Date; }
export interface Campaign extends Row { dispatchCompleted: boolean; name: string; type: Channel; status: CampaignStatus; segment: Segment | null; templateId: string; message: string | null; scheduledAt: Date | null; archivedAt: Date | null; }
export interface CampaignRecipient extends Row { campaignId: string; studentId: string; channel: string; status: string; sentAt: Date | null; openedAt: Date | null; convertedAt: Date | null; }
export interface Notification extends Row { userId: string; title: string; message: string; readAt: Date | null; dismissedAt: Date | null; sourceEventId: string; }
export interface NotificationLog extends Row { channel: string; recipient: string; templateId: string | null; status: string; sourceEventId: string; providerMessageId: string | null; attemptCount: number; errorCode: string | null; sentAt: Date | null; }
export interface IntegrationConnection extends Row { provider: string; status: string; encryptedCredentials: string; config: Json; lastSyncedAt: Date | null; }
export interface Subscription extends Row { studentId: string; provider: string; externalId: string; status: EnrollmentStatus; amountMinor: number; currency: string; currentPeriodStart: Date; currentPeriodEnd: Date; cancelledAt: Date | null; }
export interface Payment extends Row { studentId: string; provider: string; externalId: string; amountMinor: number; currency: string; status: string; occurredAt: Date; }
export interface Usage extends Row { metric: string; periodStart: Date; quantity: number; }
export interface BillingSubscription extends Row { stripeSubscriptionId: string; stripeCustomerId: string; status: string; planTier: PlanTier; currentPeriodEnd: Date; }
export interface CoachTask extends SoftRow { studentId: string; coachId: string; automationRuleId: string | null; title: string; notes: string | null; status: TaskStatus; dueDate: Date | null; }
export interface AuditLog extends Row { userId: string; action: string; entityType: string; entityId: string; diff: Json; }
export interface ConsumerReceipt extends Row { consumer: string; eventId: string; completedAt: Date; }
export interface Aggregate extends Row { kind: string; key: string; period: Date; data: Json; }
export interface ModelMap {
 organization: Organization; user: User; membership: Membership; student: Student; course: Course;
 enrollment: Enrollment; riskSnapshot: RiskSnapshot; automationRule: AutomationRule; automationExecution: AutomationExecution;
 campaign: Campaign; campaignRecipient: CampaignRecipient; notification: Notification; notificationLog: NotificationLog;
 integrationConnection: IntegrationConnection; subscription: Subscription; payment: Payment; usage: Usage;
 billingSubscription: BillingSubscription; coachTask: CoachTask; auditLog: AuditLog; consumerReceipt: ConsumerReceipt; analyticsAggregate: Aggregate;
}
export type ModelName = keyof ModelMap;



