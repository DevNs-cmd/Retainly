import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Retainly database...\n');

  // ============================================================================
  // ORGANIZATIONS
  // ============================================================================
  console.log('Creating organizations...');
  
  const org1 = await prisma.organization.create({
    data: {
      name: 'Mindful Coaching Academy',
      slug: 'mindful-coaching',
      website: 'https://mindfulcoaching.com',
      timezone: 'America/New_York',
      settings: {
        branding: {
          primaryColor: '#4F46E5',
          logo: 'https://example.com/logos/mindful.png',
        },
        notifications: {
          emailEnabled: true,
          slackEnabled: false,
        },
      },
    },
  });

  const org2 = await prisma.organization.create({
    data: {
      name: 'Digital Marketing Mastery',
      slug: 'digital-marketing-mastery',
      website: 'https://digitalmarketingmastery.io',
      timezone: 'America/Los_Angeles',
      settings: {
        branding: {
          primaryColor: '#10B981',
        },
      },
    },
  });

  console.log(`✓ Created ${2} organizations\n`);

  // ============================================================================
  // USERS
  // ============================================================================
  console.log('Creating users...');

  const user1 = await prisma.user.create({
    data: {
      email: 'sarah.johnson@mindfulcoaching.com',
      firstName: 'Sarah',
      lastName: 'Johnson',
      emailVerified: true,
      lastLoginAt: new Date('2024-02-15T10:30:00Z'),
    },
  });

  const user2 = await prisma.user.create({
    data: {
      email: 'mike.chen@mindfulcoaching.com',
      firstName: 'Mike',
      lastName: 'Chen',
      emailVerified: true,
      lastLoginAt: new Date('2024-02-14T15:20:00Z'),
    },
  });

  const user3 = await prisma.user.create({
    data: {
      email: 'alex.rodriguez@dmm.io',
      firstName: 'Alex',
      lastName: 'Rodriguez',
      emailVerified: true,
      lastLoginAt: new Date('2024-02-15T09:00:00Z'),
    },
  });

  console.log(`✓ Created ${3} users\n`);

  // ============================================================================
  // USER MEMBERSHIPS
  // ============================================================================
  console.log('Creating user memberships...');

  await prisma.userMembership.createMany({
    data: [
      {
        userId: user1.id,
        organizationId: org1.id,
        role: 'OWNER',
      },
      {
        userId: user2.id,
        organizationId: org1.id,
        role: 'COACH',
      },
      {
        userId: user3.id,
        organizationId: org2.id,
        role: 'OWNER',
      },
    ],
  });

  console.log(`✓ Created ${3} user memberships\n`);

  // ============================================================================
  // COURSES
  // ============================================================================
  console.log('Creating courses...');

  const course1 = await prisma.course.create({
    data: {
      organizationId: org1.id,
      externalId: 'kjb_mindfulness_101',
      name: 'Mindfulness Fundamentals: 30-Day Journey',
      description: 'Transform your life with daily mindfulness practices',
      platform: 'KAJABI',
      isActive: true,
      metadata: {
        duration: '30 days',
        lessons: 30,
        difficulty: 'Beginner',
      },
    },
  });

  const course2 = await prisma.course.create({
    data: {
      organizationId: org1.id,
      externalId: 'kjb_advanced_meditation',
      name: 'Advanced Meditation Techniques',
      description: 'Deep dive into advanced meditation practices',
      platform: 'KAJABI',
      isActive: true,
      metadata: {
        duration: '60 days',
        lessons: 45,
        difficulty: 'Advanced',
      },
    },
  });

  const course3 = await prisma.course.create({
    data: {
      organizationId: org2.id,
      externalId: 'thk_facebook_ads',
      name: 'Facebook Ads Mastery 2024',
      description: 'Master Facebook advertising and scale your business',
      platform: 'THINKIFIC',
      isActive: true,
      metadata: {
        duration: '90 days',
        lessons: 52,
        difficulty: 'Intermediate',
      },
    },
  });

  console.log(`✓ Created ${3} courses\n`);

  // ============================================================================
  // STUDENTS
  // ============================================================================
  console.log('Creating students...');

  const students = await prisma.student.createMany({
    data: [
      // Org 1 students
      {
        organizationId: org1.id,
        externalId: 'kjb_std_001',
        email: 'emma.wilson@gmail.com',
        firstName: 'Emma',
        lastName: 'Wilson',
        timezone: 'America/New_York',
        metadata: { source: 'organic', joinedFrom: 'webinar' },
      },
      {
        organizationId: org1.id,
        externalId: 'kjb_std_002',
        email: 'james.brown@yahoo.com',
        firstName: 'James',
        lastName: 'Brown',
        timezone: 'America/Chicago',
        metadata: { source: 'facebook_ad', joinedFrom: 'landing_page' },
      },
      {
        organizationId: org1.id,
        externalId: 'kjb_std_003',
        email: 'olivia.martinez@outlook.com',
        firstName: 'Olivia',
        lastName: 'Martinez',
        timezone: 'America/Los_Angeles',
        metadata: { source: 'instagram', joinedFrom: 'social' },
      },
      {
        organizationId: org1.id,
        externalId: 'kjb_std_004',
        email: 'noah.garcia@gmail.com',
        firstName: 'Noah',
        lastName: 'Garcia',
        timezone: 'America/Denver',
        metadata: { source: 'referral', referredBy: 'emma.wilson@gmail.com' },
      },
      {
        organizationId: org1.id,
        externalId: 'kjb_std_005',
        email: 'ava.johnson@gmail.com',
        firstName: 'Ava',
        lastName: 'Johnson',
        timezone: 'America/New_York',
        metadata: { source: 'organic', joinedFrom: 'blog' },
      },
      // Org 2 students
      {
        organizationId: org2.id,
        externalId: 'thk_std_001',
        email: 'liam.smith@gmail.com',
        firstName: 'Liam',
        lastName: 'Smith',
        timezone: 'America/New_York',
        metadata: { source: 'google_ad', businessType: 'ecommerce' },
      },
      {
        organizationId: org2.id,
        externalId: 'thk_std_002',
        email: 'sophia.davis@gmail.com',
        firstName: 'Sophia',
        lastName: 'Davis',
        timezone: 'America/Los_Angeles',
        metadata: { source: 'youtube', businessType: 'saas' },
      },
    ],
  });

  console.log(`✓ Created ${7} students\n`);

  // Get student records for relationships
  const org1Students = await prisma.student.findMany({
    where: { organizationId: org1.id },
  });
  const org2Students = await prisma.student.findMany({
    where: { organizationId: org2.id },
  });

  // ============================================================================
  // COURSE ENROLLMENTS
  // ============================================================================
  console.log('Creating course enrollments...');

  await prisma.courseEnrollment.createMany({
    data: [
      // Course 1 enrollments
      {
        organizationId: org1.id,
        studentId: org1Students[0].id,
        courseId: course1.id,
        enrolledAt: new Date('2024-01-15T10:00:00Z'),
        progress: 85,
        lastActivityAt: new Date('2024-02-14T18:30:00Z'),
        isActive: true,
      },
      {
        organizationId: org1.id,
        studentId: org1Students[1].id,
        courseId: course1.id,
        enrolledAt: new Date('2024-01-20T14:00:00Z'),
        progress: 45,
        lastActivityAt: new Date('2024-02-05T12:00:00Z'),
        isActive: true,
      },
      {
        organizationId: org1.id,
        studentId: org1Students[2].id,
        courseId: course1.id,
        enrolledAt: new Date('2024-01-25T09:00:00Z'),
        progress: 10,
        lastActivityAt: new Date('2024-01-26T10:00:00Z'),
        isActive: true,
      },
      // Course 2 enrollments
      {
        organizationId: org1.id,
        studentId: org1Students[3].id,
        courseId: course2.id,
        enrolledAt: new Date('2024-02-01T11:00:00Z'),
        progress: 30,
        lastActivityAt: new Date('2024-02-13T16:00:00Z'),
        isActive: true,
      },
      {
        organizationId: org1.id,
        studentId: org1Students[4].id,
        courseId: course2.id,
        enrolledAt: new Date('2024-02-05T13:00:00Z'),
        progress: 5,
        lastActivityAt: new Date('2024-02-06T14:00:00Z'),
        isActive: true,
      },
      // Course 3 enrollments
      {
        organizationId: org2.id,
        studentId: org2Students[0].id,
        courseId: course3.id,
        enrolledAt: new Date('2024-01-10T10:00:00Z'),
        progress: 60,
        lastActivityAt: new Date('2024-02-15T09:00:00Z'),
        isActive: true,
      },
      {
        organizationId: org2.id,
        studentId: org2Students[1].id,
        courseId: course3.id,
        enrolledAt: new Date('2024-01-28T15:00:00Z'),
        progress: 15,
        lastActivityAt: new Date('2024-01-30T11:00:00Z'),
        isActive: true,
      },
    ],
  });

  console.log(`✓ Created ${7} course enrollments\n`);

  // ============================================================================
  // ACTIVITY EVENTS
  // ============================================================================
  console.log('Creating activity events...');

  const activityEvents = [];
  
  // Active student (Emma) - consistent engagement
  for (let i = 0; i < 20; i++) {
    const daysAgo = i;
    activityEvents.push({
      organizationId: org1.id,
      studentId: org1Students[0].id,
      courseId: course1.id,
      eventType: 'LESSON_COMPLETED',
      eventName: `Lesson ${i + 1} completed`,
      occurredAt: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000),
      metadata: { lessonId: `lesson_${i + 1}`, duration: 1200 + Math.random() * 600 },
    });
  }

  // At-risk student (James) - declining engagement
  for (let i = 0; i < 5; i++) {
    const daysAgo = 10 + i * 2;
    activityEvents.push({
      organizationId: org1.id,
      studentId: org1Students[1].id,
      courseId: course1.id,
      eventType: 'LESSON_STARTED',
      eventName: `Lesson ${i + 1} started`,
      occurredAt: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000),
      metadata: { lessonId: `lesson_${i + 1}` },
    });
  }

  // High-risk student (Olivia) - almost no activity
  activityEvents.push({
    organizationId: org1.id,
    studentId: org1Students[2].id,
    courseId: course1.id,
    eventType: 'COURSE_STARTED',
    eventName: 'Course started',
    occurredAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
    metadata: {},
  });

  await prisma.activityEvent.createMany({ data: activityEvents });

  console.log(`✓ Created ${activityEvents.length} activity events\n`);

  // ============================================================================
  // RISK SCORES
  // ============================================================================
  console.log('Creating risk scores...');

  await prisma.riskScore.createMany({
    data: [
      // Emma - low risk (active student)
      {
        organizationId: org1.id,
        studentId: org1Students[0].id,
        courseId: course1.id,
        score: 15,
        riskLevel: 'LOW',
        confidence: 0.92,
        modelVersion: 'v1.2.0',
        calculatedAt: new Date('2024-02-15T06:00:00Z'),
        reasons: [
          { factor: 'high_engagement', impact: -20, description: 'Consistent daily activity' },
          { factor: 'progress_rate', impact: -15, description: 'Above average progress' },
          { factor: 'lesson_completion', impact: -10, description: '20 lessons completed' },
        ],
      },
      // James - medium risk (declining engagement)
      {
        organizationId: org1.id,
        studentId: org1Students[1].id,
        courseId: course1.id,
        score: 55,
        riskLevel: 'MEDIUM',
        confidence: 0.78,
        modelVersion: 'v1.2.0',
        calculatedAt: new Date('2024-02-15T06:00:00Z'),
        reasons: [
          { factor: 'declining_activity', impact: 25, description: 'Activity dropped 70% in last week' },
          { factor: 'low_progress', impact: 15, description: 'Below expected progress for enrollment date' },
          { factor: 'incomplete_lessons', impact: 10, description: 'Started but did not complete lessons' },
        ],
      },
      // Olivia - high risk (inactive)
      {
        organizationId: org1.id,
        studentId: org1Students[2].id,
        courseId: course1.id,
        score: 85,
        riskLevel: 'HIGH',
        confidence: 0.95,
        modelVersion: 'v1.2.0',
        calculatedAt: new Date('2024-02-15T06:00:00Z'),
        reasons: [
          { factor: 'no_activity_20_days', impact: 40, description: 'No activity in 20 days' },
          { factor: 'minimal_progress', impact: 30, description: 'Only 10% progress after 3 weeks' },
          { factor: 'no_engagement', impact: 15, description: 'Never opened emails' },
        ],
      },
      // Liam - low risk
      {
        organizationId: org2.id,
        studentId: org2Students[0].id,
        courseId: course3.id,
        score: 25,
        riskLevel: 'LOW',
        confidence: 0.88,
        modelVersion: 'v1.2.0',
        calculatedAt: new Date('2024-02-15T06:00:00Z'),
        reasons: [
          { factor: 'steady_progress', impact: -15, description: 'Consistent weekly engagement' },
          { factor: 'email_engagement', impact: -10, description: 'Opens and clicks emails regularly' },
        ],
      },
      // Sophia - critical risk
      {
        organizationId: org2.id,
        studentId: org2Students[1].id,
        courseId: course3.id,
        score: 92,
        riskLevel: 'CRITICAL',
        confidence: 0.93,
        modelVersion: 'v1.2.0',
        calculatedAt: new Date('2024-02-15T06:00:00Z'),
        reasons: [
          { factor: 'inactive_16_days', impact: 45, description: 'No activity in 16 days' },
          { factor: 'payment_issue', impact: 25, description: 'Last payment failed' },
          { factor: 'low_completion', impact: 20, description: 'Very low lesson completion rate' },
        ],
      },
    ],
  });

  console.log(`✓ Created ${5} risk scores\n`);

  // ============================================================================
  // RETENTION CAMPAIGNS
  // ============================================================================
  console.log('Creating retention campaigns...');

  const campaign1 = await prisma.retentionCampaign.create({
    data: {
      organizationId: org1.id,
      name: 'Re-engagement Series: Inactive Students',
      description: 'Automated 3-email sequence for students inactive > 14 days',
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
            subject: 'We miss you! 🌟',
            template: 'reengagement_day1',
            sendAfterDays: 0,
          },
          {
            subject: 'Your progress is waiting...',
            template: 'reengagement_day3',
            sendAfterDays: 3,
          },
          {
            subject: 'Last chance: Special offer inside',
            template: 'reengagement_day7',
            sendAfterDays: 7,
          },
        ],
      },
      startedAt: new Date('2024-02-01T00:00:00Z'),
    },
  });

  const campaign2 = await prisma.retentionCampaign.create({
    data: {
      organizationId: org1.id,
      name: 'Early Progress Boost',
      description: 'Check-in with students in first 7 days',
      campaignType: 'CHECK_IN',
      status: 'ACTIVE',
      targetConditions: {
        enrollmentDays: { lte: 7 },
        progress: { lt: 15 },
      },
      content: {
        message: 'How is your journey going? Need any support?',
        checkInType: 'coach_message',
      },
      startedAt: new Date('2024-02-10T00:00:00Z'),
    },
  });

  console.log(`✓ Created ${2} retention campaigns\n`);

  // ============================================================================
  // MESSAGE ACTIONS
  // ============================================================================
  console.log('Creating message actions...');

  await prisma.messageAction.createMany({
    data: [
      {
        organizationId: org1.id,
        campaignId: campaign1.id,
        studentId: org1Students[2].id,
        actionType: 'EMAIL',
        status: 'DELIVERED',
        content: {
          subject: 'We miss you! 🌟',
          template: 'reengagement_day1',
        },
        scheduledAt: new Date('2024-02-14T09:00:00Z'),
        sentAt: new Date('2024-02-14T09:00:05Z'),
        deliveredAt: new Date('2024-02-14T09:00:12Z'),
      },
      {
        organizationId: org1.id,
        campaignId: campaign2.id,
        studentId: org1Students[4].id,
        actionType: 'COACH_TASK',
        status: 'PENDING',
        content: {
          task: 'Personal check-in with Ava Johnson',
          priority: 'high',
          assignedTo: user2.id,
        },
        scheduledAt: new Date('2024-02-16T10:00:00Z'),
      },
    ],
  });

  console.log(`✓ Created ${2} message actions\n`);

  // ============================================================================
  // AUTOMATION RULES
  // ============================================================================
  console.log('Creating automation rules...');

  await prisma.automationRule.createMany({
    data: [
      {
        organizationId: org1.id,
        name: 'High Risk Alert',
        description: 'Notify coach when student becomes high risk',
        triggerType: 'RISK_SCORE_CHANGED',
        status: 'ACTIVE',
        priority: 1,
        createdBy: user1.id,
        conditions: {
          riskLevel: 'HIGH',
          previousRiskLevel: { in: ['LOW', 'MEDIUM'] },
        },
        actions: [
          {
            type: 'NOTIFICATION',
            target: 'coach',
            template: 'high_risk_alert',
          },
          {
            type: 'CREATE_TASK',
            assignTo: 'coach',
            priority: 'high',
          },
        ],
      },
      {
        organizationId: org1.id,
        name: 'Celebrate Milestone',
        description: 'Send congratulations on 50% course completion',
        triggerType: 'COURSE_MILESTONE',
        status: 'ACTIVE',
        priority: 5,
        createdBy: user1.id,
        conditions: {
          progress: { gte: 50 },
          previousProgress: { lt: 50 },
        },
        actions: [
          {
            type: 'SEND_EMAIL',
            template: 'milestone_50_percent',
          },
        ],
      },
    ],
  });

  console.log(`✓ Created ${2} automation rules\n`);

  // ============================================================================
  // INTEGRATIONS
  // ============================================================================
  console.log('Creating integrations...');

  await prisma.integrationConnection.createMany({
    data: [
      {
        organizationId: org1.id,
        provider: 'KAJABI',
        name: 'Main Kajabi Account',
        status: 'ACTIVE',
        config: {
          apiKeyRef: 'vault://kajabi/mindful/api_key',
          webhookUrl: 'https://retainly.app/webhooks/kajabi',
        },
        lastSyncedAt: new Date('2024-02-15T05:00:00Z'),
        syncFrequency: 60,
      },
      {
        organizationId: org1.id,
        provider: 'CONVERTKIT',
        name: 'Email Marketing',
        status: 'ACTIVE',
        config: {
          apiKeyRef: 'vault://convertkit/mindful/api_key',
          accountId: 'ck_12345',
        },
        lastSyncedAt: new Date('2024-02-15T04:30:00Z'),
        syncFrequency: 120,
      },
      {
        organizationId: org2.id,
        provider: 'THINKIFIC',
        name: 'Main Thinkific Site',
        status: 'ACTIVE',
        config: {
          apiKeyRef: 'vault://thinkific/dmm/api_key',
          subdomain: 'digitalmarketingmastery',
        },
        lastSyncedAt: new Date('2024-02-15T06:00:00Z'),
        syncFrequency: 60,
      },
      {
        organizationId: org2.id,
        provider: 'STRIPE',
        name: 'Payment Gateway',
        status: 'ACTIVE',
        config: {
          apiKeyRef: 'vault://stripe/dmm/secret_key',
          webhookSecret: 'vault://stripe/dmm/webhook_secret',
        },
        lastSyncedAt: new Date('2024-02-15T05:45:00Z'),
      },
    ],
  });

  console.log(`✓ Created ${4} integrations\n`);

  // ============================================================================
  // SUBSCRIPTIONS
  // ============================================================================
  console.log('Creating subscriptions...');

  await prisma.subscription.createMany({
    data: [
      {
        organizationId: org1.id,
        plan: 'GROWTH',
        status: 'ACTIVE',
        stripeCustomerId: 'cus_mindful123',
        stripeSubscriptionId: 'sub_mindful456',
        currentPeriodStart: new Date('2024-02-01T00:00:00Z'),
        currentPeriodEnd: new Date('2024-03-01T00:00:00Z'),
        cancelAtPeriodEnd: false,
      },
      {
        organizationId: org2.id,
        plan: 'PRO',
        status: 'ACTIVE',
        stripeCustomerId: 'cus_dmm789',
        stripeSubscriptionId: 'sub_dmm012',
        currentPeriodStart: new Date('2024-01-15T00:00:00Z'),
        currentPeriodEnd: new Date('2024-02-15T00:00:00Z'),
        cancelAtPeriodEnd: false,
      },
    ],
  });

  console.log(`✓ Created ${2} subscriptions\n`);

  // ============================================================================
  // USAGE TRACKING
  // ============================================================================
  console.log('Creating usage tracking records...');

  await prisma.usageTracking.createMany({
    data: [
      {
        organizationId: org1.id,
        metricName: 'active_students',
        metricValue: 5,
        periodStart: new Date('2024-02-01T00:00:00Z'),
        periodEnd: new Date('2024-02-28T23:59:59Z'),
      },
      {
        organizationId: org1.id,
        metricName: 'risk_scores_calculated',
        metricValue: 150,
        periodStart: new Date('2024-02-01T00:00:00Z'),
        periodEnd: new Date('2024-02-28T23:59:59Z'),
      },
      {
        organizationId: org1.id,
        metricName: 'campaigns_sent',
        metricValue: 23,
        periodStart: new Date('2024-02-01T00:00:00Z'),
        periodEnd: new Date('2024-02-28T23:59:59Z'),
      },
      {
        organizationId: org2.id,
        metricName: 'active_students',
        metricValue: 2,
        periodStart: new Date('2024-02-01T00:00:00Z'),
        periodEnd: new Date('2024-02-28T23:59:59Z'),
      },
    ],
  });

  console.log(`✓ Created ${4} usage tracking records\n`);

  // ============================================================================
  // AUDIT LOGS
  // ============================================================================
  console.log('Creating audit logs...');

  await prisma.auditLog.createMany({
    data: [
      {
        organizationId: org1.id,
        userId: user1.id,
        action: 'CAMPAIGN_CREATED',
        entityType: 'retention_campaign',
        entityId: campaign1.id,
        changes: {
          name: 'Re-engagement Series: Inactive Students',
          status: 'ACTIVE',
        },
        ipAddress: '192.168.1.100',
      },
      {
        organizationId: org1.id,
        userId: user2.id,
        action: 'AUTOMATION_ACTIVATED',
        entityType: 'automation_rule',
        changes: {
          status: { from: 'DRAFT', to: 'ACTIVE' },
        },
        ipAddress: '192.168.1.105',
      },
    ],
  });

  console.log(`✓ Created ${2} audit logs\n`);

  // ============================================================================
  // NOTIFICATIONS
  // ============================================================================
  console.log('Creating notifications...');

  await prisma.notification.createMany({
    data: [
      {
        organizationId: org1.id,
        userId: user2.id,
        type: 'ALERT',
        status: 'UNREAD',
        title: 'High Risk Student Alert',
        message: 'Olivia Martinez has been flagged as high risk (score: 85)',
        actionUrl: `/students/${org1Students[2].id}`,
      },
      {
        organizationId: org1.id,
        userId: user1.id,
        type: 'CAMPAIGN',
        status: 'READ',
        title: 'Campaign Performance Update',
        message: 'Your re-engagement campaign has a 32% open rate',
        actionUrl: `/campaigns/${campaign1.id}`,
        readAt: new Date('2024-02-15T11:00:00Z'),
      },
    ],
  });

  console.log(`✓ Created ${2} notifications\n`);

  // ============================================================================
  // RETENTION OUTCOMES
  // ============================================================================
  console.log('Creating retention outcomes...');

  await prisma.retentionOutcome.createMany({
    data: [
      {
        organizationId: org1.id,
        studentId: org1Students[1].id,
        campaignId: campaign1.id,
        riskScoreBefore: 65,
        riskScoreAfter: 45,
        retained: true,
        churned: false,
        measuredAt: new Date('2024-02-14T00:00:00Z'),
        metadata: {
          intervention: 'email_reengagement',
          daysToImprove: 7,
        },
      },
    ],
  });

  console.log(`✓ Created ${1} retention outcome\n`);

  // ============================================================================
  // SUMMARY
  // ============================================================================
  console.log('=====================================');
  console.log('✅ Database seeded successfully!\n');
  console.log('Summary:');
  console.log(`  - ${2} Organizations`);
  console.log(`  - ${3} Users`);
  console.log(`  - ${3} User Memberships`);
  console.log(`  - ${3} Courses`);
  console.log(`  - ${7} Students`);
  console.log(`  - ${7} Course Enrollments`);
  console.log(`  - ${activityEvents.length} Activity Events`);
  console.log(`  - ${5} Risk Scores`);
  console.log(`  - ${2} Retention Campaigns`);
  console.log(`  - ${2} Message Actions`);
  console.log(`  - ${2} Automation Rules`);
  console.log(`  - ${4} Integration Connections`);
  console.log(`  - ${2} Subscriptions`);
  console.log(`  - ${4} Usage Tracking Records`);
  console.log(`  - ${2} Audit Logs`);
  console.log(`  - ${2} Notifications`);
  console.log(`  - ${1} Retention Outcome`);
  console.log('=====================================\n');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
