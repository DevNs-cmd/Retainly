# Complete PostgreSQL Database Schema for Retainly

## Summary

This PR implements a **production-ready PostgreSQL database schema** for Retainly, a multi-tenant AI-powered Retention & Churn Prevention SaaS platform for online coaches and course creators.

## 📦 What's Included

### Database Schema (Prisma)
- **17 core tables** with complete relationships
- **16 PostgreSQL enums** for type safety
- **60+ strategic indexes** for performance
- **UUID primary keys** for security
- **JSONB fields** for flexible schemas
- **Row Level Security (RLS)** for multi-tenant isolation

### Documentation
- ✅ Complete database documentation (400+ lines)
- ✅ Entity relationship diagram (Mermaid)
- ✅ Step-by-step setup guide
- ✅ Quick reference with common queries
- ✅ Comprehensive summary

### Migration & Seed Data
- ✅ PostgreSQL migration SQL with RLS policies
- ✅ Seed script with 100+ demo records
- ✅ Automated triggers for `updated_at`

## 🗄️ Database Architecture

### Core Tables

**Multi-Tenancy (3 tables)**
- `organizations` - Top-level tenants (coaches/creators)
- `users` - Platform users (can belong to multiple orgs)
- `user_memberships` - User-to-org links with roles (OWNER, ADMIN, COACH, VIEWER)

**Course Management (3 tables)**
- `courses` - Educational content (supports 6 platforms)
- `students` - End users enrolled in courses
- `course_enrollments` - Links students to courses with progress tracking

**Activity & Risk (2 tables)**
- `activity_events` - All student interactions (12 event types)
- `risk_scores` - AI churn predictions (historical, never deleted)

**Retention System (3 tables)**
- `retention_campaigns` - Proactive campaigns (5 types)
- `message_actions` - Individual interventions (6 action types)
- `retention_outcomes` - Campaign effectiveness (ML feedback loop)

**Automation (1 table)**
- `automation_rules` - "If-this-then-that" workflows (6 trigger types)

**Integrations (1 table)**
- `integration_connections` - External platforms (14 providers)

**Billing (2 tables)**
- `subscriptions` - Stripe-powered billing (4 plans)
- `usage_tracking` - Usage metrics for billing/analytics

**Audit & Notifications (2 tables)**
- `audit_logs` - Immutable audit trail (GDPR/SOC 2)
- `notifications` - In-app notifications (4 types)

## ✨ Key Features

### 🔒 Multi-Tenant Security
- **Row Level Security (RLS)** enforces organization isolation at database level
- Organization A **cannot** access Organization B's data (even with SQL injection)
- All scoped tables have `organization_id` foreign key
- Automatic filtering via RLS policies

### 🤖 AI-Powered Risk Scoring
- Historical risk scores preserved for ML training
- JSONB `reasons` field explains AI decisions
- Confidence scores and model versioning
- Supports multiple risk levels: LOW, MEDIUM, HIGH, CRITICAL

### 📧 Retention System
- Campaigns target at-risk students automatically
- Message actions track delivery status (EMAIL, SMS, COACH_TASK, etc.)
- Retention outcomes measure effectiveness (before/after scores)
- ML feedback loop improves predictions over time

### ⚙️ Flexible Automation
- JSONB-based conditions and actions for complex logic
- 6 trigger types (risk changes, activity patterns, milestones, etc.)
- Priority-based execution
- Usage tracking for monitoring

### 🔌 External Integrations
- Supports 14+ platforms (Kajabi, Teachable, Stripe, Mailchimp, etc.)
- **Secure**: Config uses vault references, NOT plaintext secrets
- Sync status and error tracking
- Configurable sync frequency

### 📊 Performance Optimized
- 60+ strategic indexes for common queries
- Composite indexes for complex query patterns
- JSONB GIN indexes for metadata searches
- Partitioning strategy documented for high-volume tables

### ✅ GDPR/SOC 2 Ready
- Audit logs track all user actions
- Secure credential storage (vault references)
- No plaintext passwords or API keys
- User consent and data export support

## 📋 Tables Overview

| Table | Purpose | Key Fields |
|-------|---------|------------|
| organizations | Multi-tenant isolation | id, name, slug, settings |
| users | Platform users | id, email, first_name, last_name |
| user_memberships | User roles per org | user_id, organization_id, role |
| courses | Educational content | id, name, platform, is_active |
| students | Course enrollees | id, email, first_name, last_name |
| course_enrollments | Student progress | student_id, course_id, progress |
| activity_events | Student interactions | event_type, occurred_at, metadata |
| risk_scores | AI predictions | score, risk_level, reasons, confidence |
| retention_campaigns | Churn prevention | campaign_type, status, target_conditions |
| message_actions | Interventions | action_type, status, scheduled_at |
| automation_rules | Workflows | trigger_type, conditions, actions |
| integration_connections | External platforms | provider, status, config |
| subscriptions | Billing | plan, status, stripe_customer_id |
| usage_tracking | Metrics | metric_name, metric_value, period |
| audit_logs | Compliance | action, entity_type, changes |
| notifications | User alerts | type, status, message |
| retention_outcomes | Campaign ROI | risk_score_before, risk_score_after |

## 🎯 What's NOT Included

As requested, this PR contains **ONLY the database schema**:

❌ No backend APIs (NestJS controllers, services, DTOs)
❌ No frontend code (React, Next.js, dashboards)
❌ No authentication code (Auth0, Clerk integration)
❌ No AI/ML models (risk scoring algorithms)
❌ No background jobs (BullMQ, schedulers)

These will be implemented in future PRs.

## 📚 Documentation Files

- `apps/api/prisma/schema.prisma` - Complete Prisma schema
- `apps/api/prisma/migrations/0001_initial_retainly_schema.sql` - PostgreSQL migration
- `apps/api/prisma/seed.ts` - Demo data seeding script
- `apps/api/prisma/DATABASE_DOCUMENTATION.md` - Complete guide (400+ lines)
- `apps/api/prisma/ER_DIAGRAM.md` - Mermaid entity relationship diagram
- `apps/api/prisma/SETUP_GUIDE.md` - Step-by-step setup instructions
- `apps/api/prisma/QUICK_REFERENCE.md` - Common queries and best practices
- `DATABASE_SUMMARY.md` - High-level overview

## 🚀 Setup Instructions

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

### 3. Create Database
```bash
createdb -U postgres retainly
```

### 4. Run Migration
```bash
# Option 1: Direct SQL
psql -U postgres -d retainly -f prisma/migrations/0001_initial_retainly_schema.sql

# Option 2: Prisma
npx prisma db push
```

### 5. Generate Prisma Client
```bash
npx prisma generate
```

### 6. Seed Demo Data
```bash
npx prisma db seed
```

### 7. Verify
```bash
npx prisma studio
```

## 🧪 Testing

### Test Database Connection
```bash
npx prisma validate
```

### View Database
```bash
npx prisma studio
```
Opens at `http://localhost:5555`

### Run Seed Script
```bash
npx prisma db seed
```
Creates 100+ demo records across all tables.

## 📊 Database Statistics

- **Tables**: 17
- **Enums**: 16
- **Relationships**: 40+
- **Indexes**: 60+
- **RLS Policies**: 12
- **Triggers**: 12 (updated_at)
- **Demo Records**: 100+

## 🔐 Security Features

1. **Row Level Security (RLS)** - Database-level multi-tenancy
2. **Vault References** - No plaintext secrets
3. **Audit Logs** - Complete action trail
4. **Role-Based Access** - OWNER, ADMIN, COACH, VIEWER
5. **UUID Primary Keys** - Non-guessable IDs

## 🎨 Design Decisions

### ✅ UUID Primary Keys
- Globally unique, secure, no auto-increment race conditions

### ✅ JSONB for Flexibility
- Metadata, settings, conditions, actions
- No schema migrations for new fields

### ✅ Denormalized organization_id
- Faster queries without JOINs
- Better index performance

### ✅ Historical Risk Scores
- Never delete (ML training data)
- Query latest when needed

### ✅ ON DELETE Behavior
- CASCADE: Delete related data
- SET NULL: Preserve orphaned records
- RESTRICT: Prevent deletion if referenced

## 📈 Performance

### Index Strategy
- Primary indexes on all PKs
- Foreign key indexes
- Composite indexes for common queries
- Partial indexes for status filtering
- JSONB GIN indexes for metadata

### Scalability
- Partitioning strategy documented
- Archival strategy defined
- Connection pooling recommended
- Read replicas supported

## 🔄 Data Flow Example

1. **Student Activity** → `activity_events` created
2. **AI Risk Scoring** → `risk_scores` calculated daily
3. **Automation Trigger** → `automation_rules` detect risk change
4. **Retention Campaign** → `retention_campaigns` target high-risk
5. **Message Action** → `message_actions` sent (email/SMS)
6. **Activity Resumes** → New `activity_events`
7. **Re-scoring** → Updated `risk_scores`
8. **Outcome Measurement** → `retention_outcomes` created
9. **ML Feedback** → Model learns from outcomes

## 🐛 Breaking Changes

None - this is the initial database schema.

## ✅ Checklist

- [x] Prisma schema created with all tables
- [x] PostgreSQL migration SQL created
- [x] Seed script with demo data
- [x] ER diagram created
- [x] Complete documentation written
- [x] Setup guide created
- [x] Quick reference guide created
- [x] Security features implemented (RLS)
- [x] Performance optimizations (indexes)
- [x] Multi-tenancy enforced
- [x] Enums defined at database level
- [x] Relationships and constraints added
- [x] Triggers for updated_at created

## 🔮 Future Enhancements

### Phase 2
- [ ] A/B testing tables (`campaign_variants`)
- [ ] Webhook events (`webhook_events`)
- [ ] File attachments (`file_attachments`)
- [ ] Student cohorts (`student_cohorts`)
- [ ] Flexible tagging (`student_tags`)

### Phase 3
- [ ] Materialized views for analytics
- [ ] Time-series data optimization
- [ ] Multi-language i18n support
- [ ] White-label customization
- [ ] API rate limiting tables

## 📝 Notes

- All tables use UUID primary keys for security
- JSONB fields provide flexibility without schema changes
- Row Level Security enforces multi-tenant isolation
- Historical risk scores are NEVER deleted (ML training data)
- Vault references protect sensitive credentials
- Comprehensive documentation included

## 🤝 Review Focus Areas

1. **Schema Design** - Are relationships correct?
2. **Security** - Is RLS properly configured?
3. **Performance** - Are indexes optimal?
4. **Naming** - Are table/column names clear?
5. **Documentation** - Is everything well-documented?

## 🎉 Ready for Review!

This PR provides a **complete, production-ready database foundation** for Retainly. The schema is normalized, secure, performant, and well-documented.

---

**Database only - no application code included (as requested)**
