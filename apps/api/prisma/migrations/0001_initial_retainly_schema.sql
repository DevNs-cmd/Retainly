-- ============================================================================
-- Retainly Database Migration - Initial Schema
-- PostgreSQL with Row Level Security (RLS) for Multi-tenancy
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- ENUMS
-- ============================================================================

CREATE TYPE "UserRole" AS ENUM ('OWNER', 'ADMIN', 'COACH', 'VIEWER');
CREATE TYPE "RiskLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
CREATE TYPE "CoursePlatform" AS ENUM ('KAJABI', 'TEACHABLE', 'THINKIFIC', 'PODIA', 'CIRCLE', 'CUSTOM');
CREATE TYPE "IntegrationProvider" AS ENUM ('KAJABI', 'TEACHABLE', 'THINKIFIC', 'PODIA', 'CIRCLE', 'STRIPE', 'PAYPAL', 'MAILCHIMP', 'CONVERTKIT', 'ACTIVECAMPAIGN', 'KLAVIYO', 'CALENDLY', 'SLACK', 'CUSTOM');
CREATE TYPE "IntegrationStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'ERROR', 'DISCONNECTED');
CREATE TYPE "SubscriptionPlan" AS ENUM ('STARTER', 'GROWTH', 'PRO', 'ENTERPRISE');
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'TRIALING', 'PAST_DUE', 'CANCELED', 'EXPIRED');
CREATE TYPE "ActivityEventType" AS ENUM ('LOGIN', 'LESSON_STARTED', 'LESSON_COMPLETED', 'COURSE_STARTED', 'COURSE_COMPLETED', 'VIDEO_WATCHED', 'ASSIGNMENT_SUBMITTED', 'PAYMENT_SUCCESS', 'PAYMENT_FAILED', 'EMAIL_OPENED', 'EMAIL_CLICKED', 'INACTIVE', 'CUSTOM');
CREATE TYPE "RetentionActionType" AS ENUM ('EMAIL', 'SMS', 'COACH_TASK', 'DISCOUNT', 'WEBHOOK', 'CUSTOM');
CREATE TYPE "RetentionCampaignType" AS ENUM ('EMAIL', 'DISCOUNT', 'CHECK_IN', 'COACH_TASK', 'CUSTOM');
CREATE TYPE "CampaignStatus" AS ENUM ('DRAFT', 'ACTIVE', 'PAUSED', 'COMPLETED', 'ARCHIVED');
CREATE TYPE "ActionStatus" AS ENUM ('PENDING', 'SCHEDULED', 'SENT', 'DELIVERED', 'FAILED', 'CANCELED');
CREATE TYPE "AutomationStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'DRAFT');
CREATE TYPE "AutomationTriggerType" AS ENUM ('RISK_SCORE_CHANGED', 'ACTIVITY_DETECTED', 'INACTIVITY_DETECTED', 'COURSE_MILESTONE', 'SCHEDULE', 'MANUAL');
CREATE TYPE "NotificationType" AS ENUM ('SYSTEM', 'CAMPAIGN', 'ALERT', 'REMINDER');
CREATE TYPE "NotificationStatus" AS ENUM ('UNREAD', 'READ', 'ARCHIVED');
CREATE TYPE "OutboxStatus" AS ENUM ('PENDING', 'PROCESSING', 'PUBLISHED', 'FAILED');

-- ============================================================================
-- CORE TABLES
-- ============================================================================

-- Organizations
CREATE TABLE "organizations" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "name" VARCHAR(255) NOT NULL,
    "slug" VARCHAR(255) UNIQUE NOT NULL,
    "logo_url" TEXT,
    "website" TEXT,
    "timezone" VARCHAR(100) DEFAULT 'UTC',
    "settings" JSONB DEFAULT '{}'::jsonb,
    "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX "idx_organizations_slug" ON "organizations"("slug");

-- Users
CREATE TABLE "users" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "email" VARCHAR(255) UNIQUE NOT NULL,
    "first_name" VARCHAR(255),
    "last_name" VARCHAR(255),
    "avatar_url" TEXT,
    "email_verified" BOOLEAN DEFAULT FALSE,
    "last_login_at" TIMESTAMP,
    "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX "idx_users_email" ON "users"("email");

-- User Memberships
CREATE TABLE "user_memberships" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "organization_id" UUID NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
    "role" "UserRole" NOT NULL,
    "invited_at" TIMESTAMP NOT NULL DEFAULT NOW(),
    "joined_at" TIMESTAMP NOT NULL DEFAULT NOW(),
    "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE("user_id", "organization_id")
);

CREATE INDEX "idx_user_memberships_org_role" ON "user_memberships"("organization_id", "role");
CREATE INDEX "idx_user_memberships_user" ON "user_memberships"("user_id");

-- Courses
CREATE TABLE "courses" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "organization_id" UUID NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
    "external_id" VARCHAR(255),
    "name" VARCHAR(500) NOT NULL,
    "description" TEXT,
    "platform" "CoursePlatform" NOT NULL,
    "thumbnail_url" TEXT,
    "is_active" BOOLEAN DEFAULT TRUE,
    "metadata" JSONB DEFAULT '{}'::jsonb,
    "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE("organization_id", "external_id")
);

CREATE INDEX "idx_courses_org_active" ON "courses"("organization_id", "is_active");
CREATE INDEX "idx_courses_platform" ON "courses"("platform");

-- Students
CREATE TABLE "students" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "organization_id" UUID NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
    "external_id" VARCHAR(255),
    "email" VARCHAR(255) NOT NULL,
    "first_name" VARCHAR(255),
    "last_name" VARCHAR(255),
    "avatar_url" TEXT,
    "phone" VARCHAR(50),
    "timezone" VARCHAR(100),
    "metadata" JSONB DEFAULT '{}'::jsonb,
    "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE("organization_id", "email"),
    UNIQUE("organization_id", "external_id")
);

CREATE INDEX "idx_students_org" ON "students"("organization_id");
CREATE INDEX "idx_students_email" ON "students"("email");

-- Course Enrollments
CREATE TABLE "course_enrollments" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "organization_id" UUID NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
    "student_id" UUID NOT NULL REFERENCES "students"("id") ON DELETE CASCADE,
    "course_id" UUID NOT NULL REFERENCES "courses"("id") ON DELETE CASCADE,
    "enrolled_at" TIMESTAMP NOT NULL DEFAULT NOW(),
    "completed_at" TIMESTAMP,
    "progress" FLOAT DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    "last_activity_at" TIMESTAMP,
    "is_active" BOOLEAN DEFAULT TRUE,
    "metadata" JSONB DEFAULT '{}'::jsonb,
    "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE("student_id", "course_id")
);

CREATE INDEX "idx_enrollments_org_active" ON "course_enrollments"("organization_id", "is_active");
CREATE INDEX "idx_enrollments_course" ON "course_enrollments"("course_id");
CREATE INDEX "idx_enrollments_student" ON "course_enrollments"("student_id");
CREATE INDEX "idx_enrollments_last_activity" ON "course_enrollments"("last_activity_at");

-- ============================================================================
-- ACTIVITY & RISK TABLES
-- ============================================================================

-- Activity Events
CREATE TABLE "activity_events" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "organization_id" UUID NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
    "student_id" UUID NOT NULL REFERENCES "students"("id") ON DELETE CASCADE,
    "course_id" UUID REFERENCES "courses"("id") ON DELETE SET NULL,
    "event_type" "ActivityEventType" NOT NULL,
    "event_name" VARCHAR(255) NOT NULL,
    "metadata" JSONB DEFAULT '{}'::jsonb,
    "occurred_at" TIMESTAMP NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX "idx_activity_events_org_student_time" ON "activity_events"("organization_id", "student_id", "occurred_at");
CREATE INDEX "idx_activity_events_org_course_time" ON "activity_events"("organization_id", "course_id", "occurred_at");
CREATE INDEX "idx_activity_events_type_time" ON "activity_events"("event_type", "occurred_at");
CREATE INDEX "idx_activity_events_occurred" ON "activity_events"("occurred_at");

-- Risk Scores (Historical - never delete old scores)
CREATE TABLE "risk_scores" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "organization_id" UUID NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
    "student_id" UUID NOT NULL REFERENCES "students"("id") ON DELETE CASCADE,
    "course_id" UUID REFERENCES "courses"("id") ON DELETE SET NULL,
    "score" FLOAT NOT NULL CHECK (score >= 0 AND score <= 100),
    "risk_level" "RiskLevel" NOT NULL,
    "reasons" JSONB DEFAULT '[]'::jsonb,
    "confidence" FLOAT NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
    "model_version" VARCHAR(50) NOT NULL,
    "calculated_at" TIMESTAMP NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX "idx_risk_scores_org_student_time" ON "risk_scores"("organization_id", "student_id", "calculated_at");
CREATE INDEX "idx_risk_scores_org_level_time" ON "risk_scores"("organization_id", "risk_level", "calculated_at");
CREATE INDEX "idx_risk_scores_org_course_level" ON "risk_scores"("organization_id", "course_id", "risk_level");
CREATE INDEX "idx_risk_scores_score" ON "risk_scores"("score");
CREATE INDEX "idx_risk_scores_calculated" ON "risk_scores"("calculated_at");

-- ============================================================================
-- RETENTION & CAMPAIGNS
-- ============================================================================

-- Retention Campaigns
CREATE TABLE "retention_campaigns" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "organization_id" UUID NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "campaign_type" "RetentionCampaignType" NOT NULL,
    "status" "CampaignStatus" NOT NULL,
    "target_risk_level" "RiskLevel",
    "target_conditions" JSONB DEFAULT '{}'::jsonb,
    "content" JSONB DEFAULT '{}'::jsonb,
    "scheduled_at" TIMESTAMP,
    "started_at" TIMESTAMP,
    "completed_at" TIMESTAMP,
    "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX "idx_campaigns_org_status" ON "retention_campaigns"("organization_id", "status");
CREATE INDEX "idx_campaigns_status_scheduled" ON "retention_campaigns"("status", "scheduled_at");

-- Message Actions
CREATE TABLE "message_actions" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "organization_id" UUID NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
    "campaign_id" UUID REFERENCES "retention_campaigns"("id") ON DELETE SET NULL,
    "student_id" UUID NOT NULL REFERENCES "students"("id") ON DELETE CASCADE,
    "action_type" "RetentionActionType" NOT NULL,
    "status" "ActionStatus" NOT NULL,
    "content" JSONB DEFAULT '{}'::jsonb,
    "scheduled_at" TIMESTAMP,
    "sent_at" TIMESTAMP,
    "delivered_at" TIMESTAMP,
    "failed_at" TIMESTAMP,
    "error_message" TEXT,
    "metadata" JSONB DEFAULT '{}'::jsonb,
    "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX "idx_message_actions_org_status" ON "message_actions"("organization_id", "status");
CREATE INDEX "idx_message_actions_campaign_status" ON "message_actions"("campaign_id", "status");
CREATE INDEX "idx_message_actions_student_status" ON "message_actions"("student_id", "status");
CREATE INDEX "idx_message_actions_status_scheduled" ON "message_actions"("status", "scheduled_at");

-- ============================================================================
-- AUTOMATION
-- ============================================================================

-- Automation Rules
CREATE TABLE "automation_rules" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "organization_id" UUID NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "trigger_type" "AutomationTriggerType" NOT NULL,
    "conditions" JSONB DEFAULT '{}'::jsonb,
    "actions" JSONB DEFAULT '[]'::jsonb,
    "status" "AutomationStatus" NOT NULL,
    "priority" INTEGER DEFAULT 0,
    "created_by" UUID NOT NULL REFERENCES "users"("id") ON DELETE RESTRICT,
    "last_triggered_at" TIMESTAMP,
    "trigger_count" INTEGER DEFAULT 0,
    "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX "idx_automation_rules_org_status" ON "automation_rules"("organization_id", "status");
CREATE INDEX "idx_automation_rules_status_trigger" ON "automation_rules"("status", "trigger_type");

-- ============================================================================
-- INTEGRATIONS
-- ============================================================================

-- Integration Connections
CREATE TABLE "integration_connections" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "organization_id" UUID NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
    "provider" "IntegrationProvider" NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "status" "IntegrationStatus" NOT NULL,
    "config" JSONB DEFAULT '{}'::jsonb,
    "last_synced_at" TIMESTAMP,
    "last_error" TEXT,
    "sync_frequency" INTEGER,
    "metadata" JSONB DEFAULT '{}'::jsonb,
    "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE("organization_id", "provider", "name")
);

CREATE INDEX "idx_integrations_org_status" ON "integration_connections"("organization_id", "status");
CREATE INDEX "idx_integrations_provider_status" ON "integration_connections"("provider", "status");

-- ============================================================================
-- BILLING & USAGE
-- ============================================================================

-- Subscriptions
CREATE TABLE "subscriptions" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "organization_id" UUID UNIQUE NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
    "plan" "SubscriptionPlan" NOT NULL,
    "status" "SubscriptionStatus" NOT NULL,
    "stripe_customer_id" VARCHAR(255),
    "stripe_subscription_id" VARCHAR(255),
    "current_period_start" TIMESTAMP NOT NULL,
    "current_period_end" TIMESTAMP NOT NULL,
    "cancel_at_period_end" BOOLEAN DEFAULT FALSE,
    "canceled_at" TIMESTAMP,
    "trial_ends_at" TIMESTAMP,
    "metadata" JSONB DEFAULT '{}'::jsonb,
    "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX "idx_subscriptions_status" ON "subscriptions"("status");
CREATE INDEX "idx_subscriptions_stripe_customer" ON "subscriptions"("stripe_customer_id");

-- Usage Tracking
CREATE TABLE "usage_tracking" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "organization_id" UUID NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
    "metric_name" VARCHAR(100) NOT NULL,
    "metric_value" INTEGER NOT NULL,
    "period_start" TIMESTAMP NOT NULL,
    "period_end" TIMESTAMP NOT NULL,
    "metadata" JSONB DEFAULT '{}'::jsonb,
    "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE("organization_id", "metric_name", "period_start")
);

CREATE INDEX "idx_usage_tracking_org_period" ON "usage_tracking"("organization_id", "period_start");

-- ============================================================================
-- AUDIT & NOTIFICATIONS
-- ============================================================================

-- Audit Logs
CREATE TABLE "audit_logs" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "organization_id" UUID NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
    "user_id" UUID REFERENCES "users"("id") ON DELETE SET NULL,
    "action" VARCHAR(255) NOT NULL,
    "entity_type" VARCHAR(100) NOT NULL,
    "entity_id" UUID,
    "changes" JSONB DEFAULT '{}'::jsonb,
    "metadata" JSONB DEFAULT '{}'::jsonb,
    "ip_address" VARCHAR(50),
    "user_agent" TEXT,
    "created_at" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX "idx_audit_logs_org_time" ON "audit_logs"("organization_id", "created_at");
CREATE INDEX "idx_audit_logs_user_time" ON "audit_logs"("user_id", "created_at");
CREATE INDEX "idx_audit_logs_entity" ON "audit_logs"("entity_type", "entity_id");

-- Notifications
CREATE TABLE "notifications" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "organization_id" UUID NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
    "user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "type" "NotificationType" NOT NULL,
    "status" "NotificationStatus" NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "message" TEXT NOT NULL,
    "action_url" TEXT,
    "metadata" JSONB DEFAULT '{}'::jsonb,
    "read_at" TIMESTAMP,
    "created_at" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX "idx_notifications_user_status_time" ON "notifications"("user_id", "status", "created_at");
CREATE INDEX "idx_notifications_org_type_time" ON "notifications"("organization_id", "type", "created_at");

-- ============================================================================
-- RETENTION OUTCOMES
-- ============================================================================

-- Retention Outcomes (ML Feedback Loop)
CREATE TABLE "retention_outcomes" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "organization_id" UUID NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
    "student_id" UUID NOT NULL REFERENCES "students"("id") ON DELETE CASCADE,
    "campaign_id" UUID REFERENCES "retention_campaigns"("id") ON DELETE SET NULL,
    "action_id" UUID REFERENCES "message_actions"("id") ON DELETE SET NULL,
    "risk_score_before" FLOAT,
    "risk_score_after" FLOAT,
    "revenue_before" NUMERIC(10, 2),
    "revenue_after" NUMERIC(10, 2),
    "retained" BOOLEAN,
    "churned" BOOLEAN,
    "metadata" JSONB DEFAULT '{}'::jsonb,
    "measured_at" TIMESTAMP NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX "idx_retention_outcomes_org_measured" ON "retention_outcomes"("organization_id", "measured_at");
CREATE INDEX "idx_retention_outcomes_student_measured" ON "retention_outcomes"("student_id", "measured_at");
CREATE INDEX "idx_retention_outcomes_campaign" ON "retention_outcomes"("campaign_id");

-- ============================================================================
-- EVENT OUTBOX
-- ============================================================================

-- Outbox Events (for event-driven architecture)
CREATE TABLE "outbox_events" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "organization_id" UUID NOT NULL,
    "event_type" VARCHAR(255) NOT NULL,
    "payload" JSONB NOT NULL,
    "status" "OutboxStatus" DEFAULT 'PENDING',
    "retry_count" INTEGER DEFAULT 0,
    "error" TEXT,
    "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX "idx_outbox_events_status_time" ON "outbox_events"("status", "created_at");
CREATE INDEX "idx_outbox_events_org_type" ON "outbox_events"("organization_id", "event_type");

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) - Multi-tenancy Isolation
-- ============================================================================

-- Enable RLS on organization-scoped tables
ALTER TABLE "courses" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "students" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "course_enrollments" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "activity_events" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "risk_scores" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "retention_campaigns" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "message_actions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "automation_rules" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "integration_connections" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "usage_tracking" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "audit_logs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "retention_outcomes" ENABLE ROW LEVEL SECURITY;

-- Example RLS Policy (application needs to set current_setting('app.current_organization_id'))
-- This prevents Organization A from accessing Organization B's data at the database level

CREATE POLICY "org_isolation_courses" ON "courses"
    USING (organization_id = current_setting('app.current_organization_id')::uuid);

CREATE POLICY "org_isolation_students" ON "students"
    USING (organization_id = current_setting('app.current_organization_id')::uuid);

CREATE POLICY "org_isolation_enrollments" ON "course_enrollments"
    USING (organization_id = current_setting('app.current_organization_id')::uuid);

CREATE POLICY "org_isolation_activity_events" ON "activity_events"
    USING (organization_id = current_setting('app.current_organization_id')::uuid);

CREATE POLICY "org_isolation_risk_scores" ON "risk_scores"
    USING (organization_id = current_setting('app.current_organization_id')::uuid);

CREATE POLICY "org_isolation_campaigns" ON "retention_campaigns"
    USING (organization_id = current_setting('app.current_organization_id')::uuid);

CREATE POLICY "org_isolation_message_actions" ON "message_actions"
    USING (organization_id = current_setting('app.current_organization_id')::uuid);

CREATE POLICY "org_isolation_automation" ON "automation_rules"
    USING (organization_id = current_setting('app.current_organization_id')::uuid);

CREATE POLICY "org_isolation_integrations" ON "integration_connections"
    USING (organization_id = current_setting('app.current_organization_id')::uuid);

CREATE POLICY "org_isolation_usage" ON "usage_tracking"
    USING (organization_id = current_setting('app.current_organization_id')::uuid);

CREATE POLICY "org_isolation_audit" ON "audit_logs"
    USING (organization_id = current_setting('app.current_organization_id')::uuid);

CREATE POLICY "org_isolation_outcomes" ON "retention_outcomes"
    USING (organization_id = current_setting('app.current_organization_id')::uuid);

-- ============================================================================
-- UPDATED_AT TRIGGER FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers to relevant tables
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON "organizations" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON "users" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_memberships_updated_at BEFORE UPDATE ON "user_memberships" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON "courses" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON "students" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_course_enrollments_updated_at BEFORE UPDATE ON "course_enrollments" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_retention_campaigns_updated_at BEFORE UPDATE ON "retention_campaigns" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_message_actions_updated_at BEFORE UPDATE ON "message_actions" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_automation_rules_updated_at BEFORE UPDATE ON "automation_rules" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_integration_connections_updated_at BEFORE UPDATE ON "integration_connections" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON "subscriptions" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_outbox_events_updated_at BEFORE UPDATE ON "outbox_events" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE "organizations" IS 'Multi-tenant organizations - each coach/course creator has their own organization';
COMMENT ON TABLE "users" IS 'Platform users who can belong to multiple organizations with different roles';
COMMENT ON TABLE "students" IS 'Students enrolled in courses - scoped to organization';
COMMENT ON TABLE "activity_events" IS 'All student activity events - powers AI risk scoring';
COMMENT ON TABLE "risk_scores" IS 'Historical AI-generated churn risk scores - NEVER delete old scores';
COMMENT ON TABLE "retention_campaigns" IS 'Proactive retention campaigns to prevent churn';
COMMENT ON TABLE "automation_rules" IS 'Automated workflows triggered by events or conditions';
COMMENT ON TABLE "retention_outcomes" IS 'Measures campaign effectiveness for ML feedback loop';
COMMENT ON TABLE "outbox_events" IS 'Event sourcing outbox pattern for reliable event publishing';
