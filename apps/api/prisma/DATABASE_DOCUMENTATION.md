# Retainly Database Documentation

## Overview

This is a production-ready PostgreSQL database schema for **Retainly**, a multi-tenant AI-powered Retention & Churn Prevention SaaS platform designed for online coaches and course creators.

### Technology Stack
- **Database**: PostgreSQL 14+
- **ORM**: Prisma
- **Primary Keys**: UUID (v4)
- **Timestamps**: Automatic `created_at` and `updated_at`
- **Security**: Row Level Security (RLS) for multi-tenancy

---

## Table of Contents

1. [Core Tables](#core-tables)
2. [Multi-Tenancy Architecture](#multi-tenancy-architecture)
3. [Activity & Risk Scoring](#activity--risk-scoring)
4. [Retention System](#retention-system)
5. [Automation](#automation)
6. [Integrations](#integrations)
7. [Billing & Usage](#billing--usage)
8. [Audit & Notifications](#audit--notifications)
9. [Security](#security)
10. [Performance](#performance)
11. [Setup Instructions](#setup-instructions)

---

## Core Tables

### 1. **organizations**
The top-level tenant entity. All data is scoped to an organization.

**Key Fields:**
- `id` (UUID): Primary key
- `name`: Organization display name
- `slug`: Unique URL-friendly identifier
- `timezone`: Default timezone for the org
- `settings` (JSONB): Flexible configuration storage

**Relationships:**
- Has many: users (via memberships), courses, students, campaigns, etc.

**Use Case:**
Each coach or course creator has their own organization. Organizations are completely isolated from each other.

---

### 2. **users**
Platform users who can access one or more organizations.

**Key Fields:**
- `id` (UUID): Primary key
- `email`: Unique email address
- `first_name`, `last_name`: User name
- `email_verified`: Email verification status
- `last_login_at`: Last login timestamp

**Relationships:**
- Has many: user_memberships, automation_rules (created), audit_logs, notifications

**Use Case:**
A user can be a coach in Organization A and an admin in Organization B with different roles.

---

### 3. **user_memberships**
Junction table linking users to organizations with roles.

**Key Fields:**
- `user_id` + `organization_id`: Composite unique key
- `role`: UserRole enum (OWNER, ADMIN, COACH, VIEWER)
- `invited_at`, `joined_at`: Invitation and acceptance timestamps

**Relationships:**
- Belongs to: user, organization

**Use Case:**
Controls access and permissions. A user with role OWNER has full control; VIEWER can only read data.

---

### 4. **courses**
Educational content offered by organizations.

**Key Fields:**
- `id` (UUID): Primary key
- `organization_id`: Owner organization
- `external_id`: ID from external platform (Kajabi, Teachable, etc.)
- `name`: Course name
- `platform`: CoursePlatform enum (KAJABI, TEACHABLE, etc.)
- `is_active`: Whether course is currently active
- `metadata` (JSONB): Platform-specific custom data

**Relationships:**
- Belongs to: organization
- Has many: enrollments, activity_events, risk_scores

**Use Case:**
Represents courses imported from external platforms or created directly.

---

### 5. **students**
End users enrolled in courses.

**Key Fields:**
- `id` (UUID): Primary key
- `organization_id`: Owner organization
- `external_id`: ID from external platform
- `email`: Student email (unique per org)
- `first_name`, `last_name`: Student name
- `metadata` (JSONB): Custom fields (referral source, tags, etc.)

**Relationships:**
- Belongs to: organization
- Has many: enrollments, activity_events, risk_scores, message_actions

**Use Case:**
Students are scoped to organizations. emma@example.com in Org A is different from emma@example.com in Org B.

---

### 6. **course_enrollments**
Junction table linking students to courses with progress tracking.

**Key Fields:**
- `student_id` + `course_id`: Composite unique key
- `organization_id`: Owner organization (denormalized for performance)
- `enrolled_at`: Enrollment timestamp
- `completed_at`: Course completion timestamp
- `progress`: Percentage (0-100)
- `last_activity_at`: Most recent activity timestamp
- `is_active`: Whether enrollment is active

**Relationships:**
- Belongs to: organization, student, course

**Use Case:**
Tracks which students are enrolled in which courses and their progress. Critical for churn prediction.

---

## Activity & Risk Scoring

### 7. **activity_events**
Captures all student interactions and behaviors.

**Key Fields:**
- `id` (UUID): Primary key
- `organization_id`: Owner organization
- `student_id`: Student who performed the action
- `course_id`: Related course (optional)
- `event_type`: ActivityEventType enum (LOGIN, LESSON_COMPLETED, VIDEO_WATCHED, etc.)
- `event_name`: Human-readable event name
- `metadata` (JSONB): Event-specific data (lesson_id, video_duration, etc.)
- `occurred_at`: When the event occurred

**Relationships:**
- Belongs to: organization, student, course (optional)

**Use Case:**
Powers the AI churn prediction model. Every student action is captured here for analysis.

**Example Events:**
```json
{
  "event_type": "LESSON_COMPLETED",
  "event_name": "Completed: Introduction to Mindfulness",
  "metadata": {
    "lesson_id": "lesson_123",
    "duration_seconds": 1847,
    "quiz_score": 95
  }
}
```

**Indexes:**
- `(organization_id, student_id, occurred_at)`: Student activity timeline
- `(organization_id, course_id, occurred_at)`: Course-level analytics
- `(event_type, occurred_at)`: Event type analysis

---

### 8. **risk_scores**
AI-generated churn risk predictions (HISTORICAL - never delete).

**Key Fields:**
- `id` (UUID): Primary key
- `organization_id`: Owner organization
- `student_id`: Student being assessed
- `course_id`: Related course (optional)
- `score`: Churn risk score (0-100, higher = more risk)
- `risk_level`: RiskLevel enum (LOW, MEDIUM, HIGH, CRITICAL)
- `reasons` (JSONB): AI-generated explanations
- `confidence`: Model confidence (0-1)
- `model_version`: ML model version that generated the score
- `calculated_at`: When the score was calculated

**Relationships:**
- Belongs to: organization, student, course (optional)

**Use Case:**
Stores historical risk scores for:
1. Real-time churn prevention
2. ML model training/validation
3. Campaign effectiveness measurement
4. Trend analysis

**Example Reasons:**
```json
[
  {
    "factor": "no_activity_14_days",
    "impact": 35,
    "description": "No course activity in 14 days"
  },
  {
    "factor": "low_progress",
    "impact": 20,
    "description": "Only 15% progress after 30 days"
  },
  {
    "factor": "no_email_engagement",
    "impact": 15,
    "description": "Has not opened last 5 emails"
  }
]
```

**CRITICAL: Never delete old risk scores!** They are essential for:
- ML model retraining
- A/B testing models
- Measuring retention campaign ROI

**Indexes:**
- `(organization_id, student_id, calculated_at)`: Student risk timeline
- `(organization_id, risk_level, calculated_at)`: High-risk student identification
- `(score)`: Score-based queries

---

## Retention System

### 9. **retention_campaigns**
Proactive campaigns to prevent student churn.

**Key Fields:**
- `id` (UUID): Primary key
- `organization_id`: Owner organization
- `name`: Campaign name
- `campaign_type`: RetentionCampaignType enum (EMAIL, DISCOUNT, CHECK_IN, COACH_TASK, CUSTOM)
- `status`: CampaignStatus enum (DRAFT, ACTIVE, PAUSED, COMPLETED, ARCHIVED)
- `target_risk_level`: RiskLevel enum (which students to target)
- `target_conditions` (JSONB): Complex targeting logic
- `content` (JSONB): Campaign content (emails, messages, etc.)
- `scheduled_at`, `started_at`, `completed_at`: Campaign timeline

**Relationships:**
- Belongs to: organization
- Has many: message_actions, retention_outcomes

**Use Case:**
Automated or manual campaigns targeting at-risk students.

**Example Target Conditions:**
```json
{
  "risk_level": "HIGH",
  "inactivity_days": { "gte": 14 },
  "progress": { "lt": 30 },
  "email_engagement": { "eq": false }
}
```

**Example Content (Email Campaign):**
```json
{
  "subject": "We miss you! Come back and finish your course",
  "template": "reengagement_v2",
  "emails": [
    {
      "day": 0,
      "subject": "We miss you!",
      "template": "email_1"
    },
    {
      "day": 3,
      "subject": "Your progress is waiting",
      "template": "email_2"
    },
    {
      "day": 7,
      "subject": "Special offer: 20% off",
      "template": "email_3_discount"
    }
  ]
}
```

---

### 10. **message_actions**
Individual retention interventions sent to students.

**Key Fields:**
- `id` (UUID): Primary key
- `organization_id`: Owner organization
- `campaign_id`: Parent campaign (optional - can be standalone)
- `student_id`: Target student
- `action_type`: RetentionActionType enum (EMAIL, SMS, COACH_TASK, DISCOUNT, WEBHOOK, CUSTOM)
- `status`: ActionStatus enum (PENDING, SCHEDULED, SENT, DELIVERED, FAILED, CANCELED)
- `content` (JSONB): Action-specific content
- `scheduled_at`, `sent_at`, `delivered_at`, `failed_at`: Action timeline
- `error_message`: Error details if failed

**Relationships:**
- Belongs to: organization, campaign (optional), student
- Has many: retention_outcomes

**Use Case:**
Tracks individual messages/tasks/actions as part of retention campaigns.

**Example Actions:**

**Email:**
```json
{
  "action_type": "EMAIL",
  "content": {
    "subject": "We miss you!",
    "template": "reengagement",
    "variables": {
      "first_name": "Emma",
      "course_name": "Mindfulness 101"
    }
  }
}
```

**Coach Task:**
```json
{
  "action_type": "COACH_TASK",
  "content": {
    "task": "Personal check-in call with Emma",
    "priority": "high",
    "assigned_to": "coach_uuid",
    "notes": "Student at risk - no activity in 20 days"
  }
}
```

**Discount:**
```json
{
  "action_type": "DISCOUNT",
  "content": {
    "code": "COMEBACK20",
    "discount_percent": 20,
    "expires_in_days": 7
  }
}
```

---

## Automation

### 11. **automation_rules**
Automated workflows triggered by events or conditions.

**Key Fields:**
- `id` (UUID): Primary key
- `organization_id`: Owner organization
- `name`: Rule name
- `trigger_type`: AutomationTriggerType enum (RISK_SCORE_CHANGED, ACTIVITY_DETECTED, INACTIVITY_DETECTED, COURSE_MILESTONE, SCHEDULE, MANUAL)
- `conditions` (JSONB): When to trigger
- `actions` (JSONB): What to do when triggered
- `status`: AutomationStatus enum (ACTIVE, INACTIVE, DRAFT)
- `priority`: Execution priority (lower = higher priority)
- `created_by`: User who created the rule
- `last_triggered_at`, `trigger_count`: Usage metrics

**Relationships:**
- Belongs to: organization, creator (user)

**Use Case:**
"If-this-then-that" automation for retention workflows.

**Example Rule:**

**High Risk Alert:**
```json
{
  "name": "High Risk Alert",
  "trigger_type": "RISK_SCORE_CHANGED",
  "conditions": {
    "new_risk_level": "HIGH",
    "previous_risk_level": { "in": ["LOW", "MEDIUM"] }
  },
  "actions": [
    {
      "type": "SEND_NOTIFICATION",
      "target": "coach",
      "template": "high_risk_alert"
    },
    {
      "type": "CREATE_TASK",
      "assign_to": "coach",
      "priority": "high",
      "task": "Review student and create intervention plan"
    }
  ]
}
```

**Milestone Celebration:**
```json
{
  "name": "50% Completion Celebration",
  "trigger_type": "COURSE_MILESTONE",
  "conditions": {
    "progress": { "gte": 50, "lt": 51 }
  },
  "actions": [
    {
      "type": "SEND_EMAIL",
      "template": "milestone_50_percent"
    },
    {
      "type": "AWARD_BADGE",
      "badge_id": "halfway_hero"
    }
  ]
}
```

---

## Integrations

### 12. **integration_connections**
External platform integrations.

**Key Fields:**
- `id` (UUID): Primary key
- `organization_id`: Owner organization
- `provider`: IntegrationProvider enum (KAJABI, TEACHABLE, STRIPE, MAILCHIMP, etc.)
- `name`: Connection name (e.g., "Main Kajabi Account")
- `status`: IntegrationStatus enum (ACTIVE, INACTIVE, ERROR, DISCONNECTED)
- `config` (JSONB): Integration-specific configuration
- `last_synced_at`: Last successful sync timestamp
- `last_error`: Most recent error message
- `sync_frequency`: Sync interval in minutes

**Relationships:**
- Belongs to: organization

**Use Case:**
Connects to external platforms to sync students, courses, and activities.

**Security:**
Config JSONB uses **vault references**, NOT plaintext secrets:
```json
{
  "provider": "KAJABI",
  "config": {
    "api_key_ref": "vault://kajabi/org123/api_key",
    "webhook_url": "https://retainly.app/webhooks/kajabi",
    "account_id": "kjb_12345"
  }
}
```

**Supported Providers:**
- **Course Platforms**: Kajabi, Teachable, Thinkific, Podia, Circle
- **Payment**: Stripe, PayPal
- **Email**: Mailchimp, ConvertKit, ActiveCampaign, Klaviyo
- **Other**: Calendly, Slack, Custom webhooks

---

## Billing & Usage

### 13. **subscriptions**
Organization-level subscription management.

**Key Fields:**
- `id` (UUID): Primary key
- `organization_id`: Owner organization (unique - one subscription per org)
- `plan`: SubscriptionPlan enum (STARTER, GROWTH, PRO, ENTERPRISE)
- `status`: SubscriptionStatus enum (ACTIVE, TRIALING, PAST_DUE, CANCELED, EXPIRED)
- `stripe_customer_id`, `stripe_subscription_id`: Stripe references
- `current_period_start`, `current_period_end`: Billing period
- `cancel_at_period_end`: Whether subscription will auto-cancel
- `trial_ends_at`: Trial expiration date

**Relationships:**
- Belongs to: organization (one-to-one)

**Use Case:**
Manages billing through Stripe. Each organization has exactly one subscription.

---

### 14. **usage_tracking**
Tracks usage metrics for billing and analytics.

**Key Fields:**
- `id` (UUID): Primary key
- `organization_id`: Owner organization
- `metric_name`: Metric identifier (e.g., "active_students", "risk_scores_calculated")
- `metric_value`: Integer value
- `period_start`, `period_end`: Tracking period

**Relationships:**
- Belongs to: organization

**Use Case:**
Tracks usage for:
- Billing (e.g., charge per active student)
- Analytics (e.g., campaign volume)
- Plan limits (e.g., max 100 students on STARTER plan)

**Example Metrics:**
- `active_students`: Number of enrolled students
- `risk_scores_calculated`: AI model invocations
- `campaigns_sent`: Retention campaigns executed
- `email_actions_sent`: Emails sent
- `automation_triggers`: Automation rule executions

---

## Audit & Notifications

### 15. **audit_logs**
Immutable audit trail of all user actions.

**Key Fields:**
- `id` (UUID): Primary key
- `organization_id`: Owner organization
- `user_id`: User who performed the action
- `action`: Action identifier (e.g., "CAMPAIGN_CREATED", "STUDENT_DELETED")
- `entity_type`: Entity being acted upon (e.g., "retention_campaign")
- `entity_id`: Entity UUID
- `changes` (JSONB): What changed (before/after)
- `metadata` (JSONB): Additional context
- `ip_address`, `user_agent`: Client information
- `created_at`: When the action occurred

**Relationships:**
- Belongs to: organization, user (optional)

**Use Case:**
Compliance, security, debugging. Required for GDPR, SOC 2, etc.

**Example Log:**
```json
{
  "action": "CAMPAIGN_ACTIVATED",
  "entity_type": "retention_campaign",
  "entity_id": "campaign_uuid",
  "changes": {
    "status": {
      "from": "DRAFT",
      "to": "ACTIVE"
    }
  },
  "metadata": {
    "ip_address": "203.0.113.42",
    "user_agent": "Mozilla/5.0..."
  }
}
```

---

### 16. **notifications**
In-app notifications for users.

**Key Fields:**
- `id` (UUID): Primary key
- `organization_id`: Owner organization
- `user_id`: Recipient user
- `type`: NotificationType enum (SYSTEM, CAMPAIGN, ALERT, REMINDER)
- `status`: NotificationStatus enum (UNREAD, READ, ARCHIVED)
- `title`: Notification title
- `message`: Notification body
- `action_url`: Optional deep link
- `read_at`: When the notification was read

**Relationships:**
- Belongs to: organization, user

**Use Case:**
Notifies coaches about:
- High-risk students
- Campaign performance
- System updates
- Task assignments

---

## Retention Outcomes

### 17. **retention_outcomes**
Measures the effectiveness of retention campaigns (ML feedback loop).

**Key Fields:**
- `id` (UUID): Primary key
- `organization_id`: Owner organization
- `student_id`: Student being measured
- `campaign_id`: Related campaign (optional)
- `action_id`: Related action (optional)
- `risk_score_before`, `risk_score_after`: Score change
- `revenue_before`, `revenue_after`: Revenue impact
- `retained`: Whether the student was retained
- `churned`: Whether the student churned
- `measured_at`: Measurement timestamp

**Relationships:**
- Belongs to: organization, student, campaign (optional), action (optional)

**Use Case:**
Critical for:
1. **ML Model Training**: Feedback loop to improve AI predictions
2. **Campaign ROI**: Measure effectiveness of retention campaigns
3. **A/B Testing**: Compare campaign variants
4. **Analytics**: Which interventions work best?

**Example Outcome:**
```json
{
  "student_id": "student_uuid",
  "campaign_id": "campaign_uuid",
  "risk_score_before": 75.0,
  "risk_score_after": 45.0,
  "retained": true,
  "churned": false,
  "measured_at": "2024-02-20T00:00:00Z",
  "metadata": {
    "intervention_type": "email_sequence",
    "days_to_improve": 7,
    "opened_email": true,
    "clicked_link": true
  }
}
```

---

## Multi-Tenancy Architecture

### Organization Isolation

Every organization's data is **completely isolated** using:

1. **Foreign Keys**: All scoped tables have `organization_id` FK
2. **Row Level Security (RLS)**: PostgreSQL RLS policies enforce isolation at the database level
3. **Application Logic**: ORM queries always filter by `organization_id`

### RLS Implementation

```sql
-- Enable RLS on scoped tables
ALTER TABLE students ENABLE ROW LEVEL SECURITY;

-- Policy: Only allow access to current organization's data
CREATE POLICY "org_isolation_students" ON students
  USING (organization_id = current_setting('app.current_organization_id')::uuid);
```

**How It Works:**
1. Application sets session variable: `SET app.current_organization_id = 'org_uuid'`
2. All queries automatically filtered by RLS policy
3. Even with SQL injection, Organization A cannot access Organization B's data

### Benefits:
- **Security**: Database-level isolation
- **Compliance**: Meets GDPR, SOC 2 requirements
- **Performance**: Queries automatically scoped
- **Simplicity**: Developers don't need to remember to filter

---

## Security

### Sensitive Data Protection

**NEVER store in plaintext:**
- ❌ User passwords (use external auth: Auth0, Clerk, Firebase)
- ❌ API keys (use vault references)
- ❌ Stripe secrets (use vault references)
- ❌ Integration credentials (use vault references)

**Use vault references instead:**
```json
{
  "api_key_ref": "vault://kajabi/org123/api_key",
  "stripe_secret_ref": "vault://stripe/org123/secret_key"
}
```

### Data Isolation
- All queries filtered by `organization_id`
- RLS enforced at database level
- No cross-tenant data access possible

### Access Control
- User roles: OWNER > ADMIN > COACH > VIEWER
- Role-based permissions in application layer
- Audit logs track all actions

---

## Performance

### Indexes

**Critical indexes for performance:**

1. **Multi-tenant queries**: `organization_id` on ALL scoped tables
2. **Student lookups**: `(organization_id, email)`, `(organization_id, external_id)`
3. **Time-series queries**: `occurred_at`, `calculated_at`, `measured_at`
4. **Risk analysis**: `(organization_id, risk_level, calculated_at)`
5. **Campaign queries**: `(organization_id, status)`, `(status, scheduled_at)`
6. **Activity tracking**: `(organization_id, student_id, occurred_at)`

### Query Optimization

**Composite indexes for common queries:**
```sql
-- Most recent risk score per student
CREATE INDEX idx_risk_scores_org_student_time 
  ON risk_scores(organization_id, student_id, calculated_at DESC);

-- Active campaigns
CREATE INDEX idx_campaigns_org_status 
  ON retention_campaigns(organization_id, status) 
  WHERE status IN ('ACTIVE', 'SCHEDULED');

-- Recent activity by student
CREATE INDEX idx_activity_events_org_student_time 
  ON activity_events(organization_id, student_id, occurred_at DESC);
```

### Partitioning Strategy (Future)

For high-volume tables, consider time-based partitioning:

**activity_events** (quarterly partitions):
```sql
CREATE TABLE activity_events_2024_q1 PARTITION OF activity_events
  FOR VALUES FROM ('2024-01-01') TO ('2024-04-01');
```

**Benefits:**
- Faster queries (scan only relevant partitions)
- Easier archival (drop old partitions)
- Better vacuum performance

---

## Setup Instructions

### 1. Install Dependencies

```bash
cd apps/api
npm install
```

### 2. Configure Database

Create `.env` file:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/retainly?schema=public"
```

### 3. Generate Prisma Client

```bash
npx prisma generate
```

### 4. Run Migration

```bash
# Apply the SQL migration
psql -d retainly -f prisma/migrations/0001_initial_retainly_schema.sql

# OR use Prisma Migrate
npx prisma migrate deploy
```

### 5. Seed Database

```bash
npx prisma db seed
```

### 6. Verify Setup

```bash
# Open Prisma Studio
npx prisma studio
```

---

## Common Queries

### Get Latest Risk Score for Student

```typescript
const latestRiskScore = await prisma.riskScore.findFirst({
  where: {
    organizationId: orgId,
    studentId: studentId,
  },
  orderBy: {
    calculatedAt: 'desc',
  },
});
```

### Get High-Risk Students

```typescript
const highRiskStudents = await prisma.student.findMany({
  where: {
    organizationId: orgId,
    riskScores: {
      some: {
        riskLevel: 'HIGH',
        calculatedAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
        },
      },
    },
  },
  include: {
    riskScores: {
      where: {
        calculatedAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
      },
      orderBy: {
        calculatedAt: 'desc',
      },
      take: 1,
    },
    enrollments: {
      include: {
        course: true,
      },
    },
  },
});
```

### Get Student Activity Timeline

```typescript
const activityTimeline = await prisma.activityEvent.findMany({
  where: {
    organizationId: orgId,
    studentId: studentId,
  },
  orderBy: {
    occurredAt: 'desc',
  },
  take: 50,
  include: {
    course: {
      select: {
        name: true,
      },
    },
  },
});
```

### Get Campaign Performance

```typescript
const campaignPerformance = await prisma.retentionCampaign.findUnique({
  where: { id: campaignId },
  include: {
    messageActions: {
      select: {
        status: true,
      },
    },
    retentionOutcomes: {
      select: {
        retained: true,
        churned: true,
        riskScoreBefore: true,
        riskScoreAfter: true,
      },
    },
  },
});
```

---

## Maintenance

### Backup Strategy

1. **Daily automated backups**: Full database backup
2. **WAL archiving**: Point-in-time recovery
3. **Retention**: 30 days for daily, 1 year for monthly

### Archive Strategy

**activity_events** (keep 2 years in hot storage):
```sql
DELETE FROM activity_events 
WHERE created_at < NOW() - INTERVAL '2 years';
```

**audit_logs** (keep 7 years for compliance):
```sql
-- Move to archive table instead of deleting
INSERT INTO audit_logs_archive 
SELECT * FROM audit_logs 
WHERE created_at < NOW() - INTERVAL '2 years';
```

**NEVER delete risk_scores** - they are ML training data!

### Monitoring

Monitor these metrics:
- Query performance (slow queries)
- Table sizes (growth rate)
- Index usage (unused indexes)
- RLS policy overhead
- Connection pool saturation

---

## Support

For questions or issues:
- Email: dev@retainly.app
- Docs: https://docs.retainly.app
- GitHub: https://github.com/retainly/retainly

---

**License**: Proprietary
**Version**: 1.0.0
**Last Updated**: 2024-02-15
