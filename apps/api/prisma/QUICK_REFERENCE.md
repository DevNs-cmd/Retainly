# Retainly Database - Quick Reference

## Schema Overview

### 17 Tables
1. **organizations** - Tenants (coaches/creators)
2. **users** - Platform users
3. **user_memberships** - User-to-org links with roles
4. **courses** - Educational content
5. **students** - End users enrolled in courses
6. **course_enrollments** - Student-to-course links
7. **activity_events** - All student interactions
8. **risk_scores** - AI churn predictions (historical)
9. **retention_campaigns** - Proactive campaigns
10. **message_actions** - Individual interventions
11. **automation_rules** - "If-this-then-that" workflows
12. **integration_connections** - External platform integrations
13. **subscriptions** - Billing via Stripe
14. **usage_tracking** - Usage metrics
15. **audit_logs** - Audit trail (compliance)
16. **notifications** - In-app notifications
17. **retention_outcomes** - Campaign effectiveness (ML feedback)

---

## Common Queries

### Get Organization with All Data

```typescript
const org = await prisma.organization.findUnique({
  where: { id: orgId },
  include: {
    users: {
      include: {
        user: true,
      },
    },
    courses: true,
    students: {
      take: 10,
    },
    campaigns: {
      where: {
        status: 'ACTIVE',
      },
    },
  },
});
```

### Get Student with Risk Score and Enrollments

```typescript
const student = await prisma.student.findUnique({
  where: { id: studentId },
  include: {
    enrollments: {
      include: {
        course: true,
      },
    },
    riskScores: {
      orderBy: {
        calculatedAt: 'desc',
      },
      take: 1, // Latest score only
    },
    activityEvents: {
      orderBy: {
        occurredAt: 'desc',
      },
      take: 20, // Last 20 events
    },
  },
});
```

### Get High-Risk Students

```typescript
// Option 1: Using raw SQL for latest risk score per student
const highRiskStudents = await prisma.$queryRaw`
  SELECT DISTINCT ON (s.id)
    s.*,
    rs.score,
    rs.risk_level,
    rs.calculated_at
  FROM students s
  INNER JOIN risk_scores rs ON rs.student_id = s.id
  WHERE s.organization_id = ${orgId}::uuid
    AND rs.risk_level IN ('HIGH', 'CRITICAL')
  ORDER BY s.id, rs.calculated_at DESC
`;

// Option 2: Using Prisma (gets all students, filter in app)
const students = await prisma.student.findMany({
  where: {
    organizationId: orgId,
  },
  include: {
    riskScores: {
      orderBy: {
        calculatedAt: 'desc',
      },
      take: 1,
    },
  },
});

const highRisk = students.filter(
  (s) => s.riskScores[0]?.riskLevel === 'HIGH' || 
         s.riskScores[0]?.riskLevel === 'CRITICAL'
);
```

### Get Student Activity Timeline

```typescript
const timeline = await prisma.activityEvent.findMany({
  where: {
    organizationId: orgId,
    studentId: studentId,
  },
  orderBy: {
    occurredAt: 'desc',
  },
  include: {
    course: {
      select: {
        name: true,
      },
    },
  },
  take: 50,
});
```

### Get Active Campaigns

```typescript
const campaigns = await prisma.retentionCampaign.findMany({
  where: {
    organizationId: orgId,
    status: 'ACTIVE',
  },
  include: {
    messageActions: {
      where: {
        status: {
          in: ['PENDING', 'SCHEDULED'],
        },
      },
    },
    _count: {
      select: {
        messageActions: true,
        retentionOutcomes: true,
      },
    },
  },
});
```

### Get Campaign Performance

```typescript
const campaign = await prisma.retentionCampaign.findUnique({
  where: { id: campaignId },
  include: {
    messageActions: true,
    retentionOutcomes: true,
  },
});

// Calculate metrics
const totalActions = campaign.messageActions.length;
const sent = campaign.messageActions.filter(a => a.status === 'SENT').length;
const delivered = campaign.messageActions.filter(a => a.status === 'DELIVERED').length;
const failed = campaign.messageActions.filter(a => a.status === 'FAILED').length;

const outcomes = campaign.retentionOutcomes;
const retained = outcomes.filter(o => o.retained).length;
const avgScoreImprovement = outcomes.reduce(
  (sum, o) => sum + ((o.riskScoreBefore || 0) - (o.riskScoreAfter || 0)), 
  0
) / outcomes.length;

console.log({
  totalActions,
  sent,
  delivered,
  failed,
  deliveryRate: (delivered / sent) * 100,
  retentionRate: (retained / outcomes.length) * 100,
  avgScoreImprovement,
});
```

### Get Automation Rules

```typescript
const rules = await prisma.automationRule.findMany({
  where: {
    organizationId: orgId,
    status: 'ACTIVE',
  },
  include: {
    creator: {
      select: {
        firstName: true,
        lastName: true,
        email: true,
      },
    },
  },
  orderBy: {
    priority: 'asc', // Lower priority = higher importance
  },
});
```

### Get Integrations Status

```typescript
const integrations = await prisma.integrationConnection.findMany({
  where: {
    organizationId: orgId,
  },
  select: {
    id: true,
    provider: true,
    name: true,
    status: true,
    lastSyncedAt: true,
    lastError: true,
  },
});

// Check for errors
const hasErrors = integrations.some(i => i.status === 'ERROR');
const staleIntegrations = integrations.filter(
  i => i.lastSyncedAt < new Date(Date.now() - 24 * 60 * 60 * 1000) // > 24 hours
);
```

### Get Usage Metrics

```typescript
const currentPeriod = {
  start: new Date('2024-02-01'),
  end: new Date('2024-02-29'),
};

const usage = await prisma.usageTracking.findMany({
  where: {
    organizationId: orgId,
    periodStart: currentPeriod.start,
    periodEnd: currentPeriod.end,
  },
});

const metrics = usage.reduce((acc, u) => {
  acc[u.metricName] = u.metricValue;
  return acc;
}, {} as Record<string, number>);

console.log('Usage:', metrics);
// { active_students: 5, risk_scores_calculated: 150, campaigns_sent: 23 }
```

### Get Audit Logs

```typescript
const logs = await prisma.auditLog.findMany({
  where: {
    organizationId: orgId,
    createdAt: {
      gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
    },
  },
  include: {
    user: {
      select: {
        firstName: true,
        lastName: true,
        email: true,
      },
    },
  },
  orderBy: {
    createdAt: 'desc',
  },
  take: 100,
});
```

### Create Student with Enrollment

```typescript
const student = await prisma.student.create({
  data: {
    organizationId: orgId,
    email: 'john.doe@example.com',
    firstName: 'John',
    lastName: 'Doe',
    enrollments: {
      create: {
        organizationId: orgId,
        courseId: courseId,
        enrolledAt: new Date(),
        progress: 0,
      },
    },
  },
  include: {
    enrollments: {
      include: {
        course: true,
      },
    },
  },
});
```

### Log Activity Event

```typescript
const event = await prisma.activityEvent.create({
  data: {
    organizationId: orgId,
    studentId: studentId,
    courseId: courseId,
    eventType: 'LESSON_COMPLETED',
    eventName: 'Completed: Introduction to Mindfulness',
    occurredAt: new Date(),
    metadata: {
      lessonId: 'lesson_123',
      durationSeconds: 1847,
      quizScore: 95,
    },
  },
});

// Update enrollment progress
await prisma.courseEnrollment.update({
  where: {
    studentId_courseId: {
      studentId: studentId,
      courseId: courseId,
    },
  },
  data: {
    lastActivityAt: new Date(),
    progress: {
      increment: 3.33, // 1 lesson out of 30 = ~3.33%
    },
  },
});
```

### Calculate and Store Risk Score

```typescript
// 1. Get student data for scoring
const studentData = await prisma.student.findUnique({
  where: { id: studentId },
  include: {
    enrollments: true,
    activityEvents: {
      where: {
        occurredAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
        },
      },
    },
  },
});

// 2. Calculate risk (your AI logic here)
const riskScore = calculateChurnRisk(studentData); // Your ML model

// 3. Store the score
const savedScore = await prisma.riskScore.create({
  data: {
    organizationId: orgId,
    studentId: studentId,
    courseId: studentData.enrollments[0]?.courseId,
    score: riskScore.score, // 0-100
    riskLevel: riskScore.level, // LOW, MEDIUM, HIGH, CRITICAL
    confidence: riskScore.confidence, // 0-1
    modelVersion: 'v1.2.0',
    calculatedAt: new Date(),
    reasons: riskScore.reasons, // JSONB array
  },
});
```

### Create Retention Campaign

```typescript
const campaign = await prisma.retentionCampaign.create({
  data: {
    organizationId: orgId,
    name: 'Re-engagement: Inactive Students',
    description: '3-email sequence for students inactive > 14 days',
    campaignType: 'EMAIL',
    status: 'ACTIVE',
    targetRiskLevel: 'HIGH',
    targetConditions: {
      inactivityDays: { gte: 14 },
      progress: { lt: 30 },
    },
    content: {
      emails: [
        {
          day: 0,
          subject: 'We miss you!',
          template: 'reengagement_day1',
        },
        {
          day: 3,
          subject: 'Your progress is waiting',
          template: 'reengagement_day3',
        },
        {
          day: 7,
          subject: 'Special offer inside',
          template: 'reengagement_day7',
        },
      ],
    },
    startedAt: new Date(),
  },
});
```

### Send Message Action

```typescript
const action = await prisma.messageAction.create({
  data: {
    organizationId: orgId,
    campaignId: campaignId,
    studentId: studentId,
    actionType: 'EMAIL',
    status: 'SCHEDULED',
    content: {
      subject: 'We miss you!',
      template: 'reengagement_day1',
      variables: {
        firstName: student.firstName,
        courseName: course.name,
      },
    },
    scheduledAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour from now
  },
});

// Later, when email is sent:
await prisma.messageAction.update({
  where: { id: action.id },
  data: {
    status: 'SENT',
    sentAt: new Date(),
  },
});

// Later, when email is delivered:
await prisma.messageAction.update({
  where: { id: action.id },
  data: {
    status: 'DELIVERED',
    deliveredAt: new Date(),
  },
});
```

### Measure Retention Outcome

```typescript
const outcome = await prisma.retentionOutcome.create({
  data: {
    organizationId: orgId,
    studentId: studentId,
    campaignId: campaignId,
    actionId: actionId,
    riskScoreBefore: 85,
    riskScoreAfter: 45,
    retained: true,
    churned: false,
    measuredAt: new Date(),
    metadata: {
      daysToImprove: 7,
      emailOpened: true,
      emailClicked: true,
    },
  },
});
```

---

## Transactions

### Create Student with Enrollment and Log (Atomic)

```typescript
const result = await prisma.$transaction(async (tx) => {
  // 1. Create student
  const student = await tx.student.create({
    data: {
      organizationId: orgId,
      email: 'jane@example.com',
      firstName: 'Jane',
      lastName: 'Doe',
    },
  });

  // 2. Create enrollment
  const enrollment = await tx.courseEnrollment.create({
    data: {
      organizationId: orgId,
      studentId: student.id,
      courseId: courseId,
      enrolledAt: new Date(),
    },
  });

  // 3. Log audit event
  await tx.auditLog.create({
    data: {
      organizationId: orgId,
      userId: currentUserId,
      action: 'STUDENT_CREATED',
      entityType: 'student',
      entityId: student.id,
      changes: {
        email: student.email,
        courseId: courseId,
      },
    },
  });

  return { student, enrollment };
});
```

---

## Aggregations

### Count Students by Risk Level

```typescript
const counts = await prisma.$queryRaw`
  SELECT
    risk_level,
    COUNT(DISTINCT student_id) as student_count
  FROM (
    SELECT DISTINCT ON (student_id)
      student_id,
      risk_level,
      calculated_at
    FROM risk_scores
    WHERE organization_id = ${orgId}::uuid
    ORDER BY student_id, calculated_at DESC
  ) latest_scores
  GROUP BY risk_level
  ORDER BY risk_level
`;
```

### Activity Events by Type (Last 30 Days)

```typescript
const activityStats = await prisma.activityEvent.groupBy({
  by: ['eventType'],
  where: {
    organizationId: orgId,
    occurredAt: {
      gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    },
  },
  _count: {
    id: true,
  },
  orderBy: {
    _count: {
      id: 'desc',
    },
  },
});
```

---

## Useful Raw Queries

### Students Who Haven't Logged In (30 Days)

```typescript
const inactiveStudents = await prisma.$queryRaw`
  SELECT
    s.*,
    ce.last_activity_at
  FROM students s
  INNER JOIN course_enrollments ce ON ce.student_id = s.id
  WHERE s.organization_id = ${orgId}::uuid
    AND ce.is_active = true
    AND (
      ce.last_activity_at IS NULL
      OR ce.last_activity_at < NOW() - INTERVAL '30 days'
    )
  ORDER BY ce.last_activity_at ASC NULLS FIRST
`;
```

### Campaign Performance Summary

```typescript
const performance = await prisma.$queryRaw`
  SELECT
    c.id,
    c.name,
    COUNT(DISTINCT ma.id) as total_actions,
    COUNT(DISTINCT CASE WHEN ma.status = 'DELIVERED' THEN ma.id END) as delivered,
    COUNT(DISTINCT CASE WHEN ma.status = 'FAILED' THEN ma.id END) as failed,
    COUNT(DISTINCT ro.id) as outcomes,
    COUNT(DISTINCT CASE WHEN ro.retained = true THEN ro.id END) as retained,
    AVG(ro.risk_score_before - ro.risk_score_after) as avg_score_improvement
  FROM retention_campaigns c
  LEFT JOIN message_actions ma ON ma.campaign_id = c.id
  LEFT JOIN retention_outcomes ro ON ro.campaign_id = c.id
  WHERE c.organization_id = ${orgId}::uuid
    AND c.status = 'ACTIVE'
  GROUP BY c.id, c.name
  ORDER BY c.created_at DESC
`;
```

---

## Best Practices

### ✅ Always Filter by organization_id

```typescript
// Good
const students = await prisma.student.findMany({
  where: {
    organizationId: orgId,
    email: email,
  },
});

// Bad (cross-tenant leak)
const students = await prisma.student.findMany({
  where: {
    email: email, // Missing organizationId!
  },
});
```

### ✅ Use Transactions for Multi-Step Operations

```typescript
await prisma.$transaction([
  prisma.student.update({ ... }),
  prisma.auditLog.create({ ... }),
]);
```

### ✅ Index Your JSONB Queries

```sql
CREATE INDEX idx_activity_events_metadata_lesson 
  ON activity_events USING GIN ((metadata->'lessonId'));
```

### ✅ Don't Delete Risk Scores (ML Training Data)

```typescript
// Bad
await prisma.riskScore.delete({ where: { id } });

// Good - keep all scores for ML training
// Just query the latest when needed
```

### ✅ Use Select to Reduce Payload Size

```typescript
// Good - only get needed fields
const students = await prisma.student.findMany({
  select: {
    id: true,
    email: true,
    firstName: true,
    lastName: true,
  },
});

// Bad - returns all fields including large JSONB
const students = await prisma.student.findMany();
```

---

## Environment Variables

```env
# Required
DATABASE_URL="postgresql://user:pass@host:5432/retainly?schema=public"

# Optional (for connection pooling)
DATABASE_URL_POOLED="postgresql://user:pass@pooler:6543/retainly?schema=public"

# Optional (for shadow database in dev)
SHADOW_DATABASE_URL="postgresql://user:pass@host:5432/retainly_shadow?schema=public"
```

---

## Commands

```bash
# Generate Prisma Client
npx prisma generate

# Validate schema
npx prisma validate

# Format schema
npx prisma format

# Push schema (dev only)
npx prisma db push

# Create migration
npx prisma migrate dev --name add_field

# Apply migrations (production)
npx prisma migrate deploy

# Reset database (dev only)
npx prisma migrate reset

# Seed database
npx prisma db seed

# Open Prisma Studio
npx prisma studio

# Pull schema from database
npx prisma db pull
```

---

## File Locations

```
apps/api/prisma/
├── schema.prisma                          # Prisma schema
├── migrations/
│   └── 0001_initial_retainly_schema.sql  # SQL migration
├── seed.ts                                # Seed script
├── ER_DIAGRAM.md                          # Entity relationship diagram
├── DATABASE_DOCUMENTATION.md              # Complete documentation
├── SETUP_GUIDE.md                         # Setup instructions
└── QUICK_REFERENCE.md                     # This file
```

---

**For detailed documentation, see:**
- `DATABASE_DOCUMENTATION.md` - Complete guide
- `ER_DIAGRAM.md` - Visual relationships
- `SETUP_GUIDE.md` - Setup instructions
