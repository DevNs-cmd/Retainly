import 'package:flutter_test/flutter_test.dart';
import 'package:retainly_mobile/features/students/models/student_model.dart';
import 'package:retainly_mobile/features/tasks/models/task_model.dart';
import 'package:retainly_mobile/features/analytics/models/analytics_models.dart';
import 'package:retainly_mobile/features/courses/models_and_repo.dart';
import 'package:retainly_mobile/features/campaigns/models_and_repo.dart';
import 'package:retainly_mobile/features/billing/models_and_repo.dart';
import 'package:retainly_mobile/features/integrations/models_and_repo.dart';

void main() {
  group('Data Models & JSON Serialization Tests', () {
    test('StudentModel parses correctly from JSON and normalizes risk score', () {
      final json = {
        'id': 'std-101',
        'organizationId': 'org-1',
        'name': 'Jane Doe',
        'email': 'jane@example.com',
        'riskScore': 85,
        'segment': 'HIGH_RISK',
        'latestRiskSnapshot': {
          'reasons': ['Low LMS login frequency', 'Assignment overdue']
        }
      };

      final student = StudentModel.fromJson(json);
      expect(student.id, 'std-101');
      expect(student.name, 'Jane Doe');
      expect(student.riskLevel, 'HIGH');
      expect(student.normalizedScore, 85);
      expect(student.reasons.length, 2);
      expect(student.reasons[0], 'Low LMS login frequency');
    });

    test('CoachTaskModel parses correctly and tracks completion status', () {
      final json = {
        'id': 'task-1',
        'organizationId': 'org-1',
        'studentId': 'std-101',
        'title': 'Reach out via SMS',
        'status': 'DONE',
        'notes': 'Learner responded positively'
      };

      final task = CoachTaskModel.fromJson(json);
      expect(task.title, 'Reach out via SMS');
      expect(task.isCompleted, isTrue);
      expect(task.notes, 'Learner responded positively');
    });

    test('RiskTrendPoint calculates retention rate and at-risk counts accurately', () {
      final json = {
        'period': '2026-10-01T00:00:00.000Z',
        'data': {
          'CHAMPION': 40,
          'LOW_RISK': 30,
          'MEDIUM_RISK': 20,
          'HIGH_RISK': 10,
          'UNSCORED': 0
        }
      };

      final trend = RiskTrendPoint.fromJson(json);
      expect(trend.total, 100);
      expect(trend.retentionRate, 70); // (40 + 30) / 100 = 70%
      expect(trend.atRiskCount, 30); // 20 + 10 = 30
      expect(trend.highRisk, 10);
    });

    test('OverviewModel parses overview statistics', () {
      final json = {
        'churnRate': 12.5,
        'atRiskCount': 14,
        'studentsSaved': 8,
        'revenueAtRiskMinorByCurrency': {'USD': 120000}
      };

      final overview = OverviewModel.fromJson(json);
      expect(overview.churnRate, 12.5);
      expect(overview.atRiskCount, 14);
      expect(overview.studentsSaved, 8);
    });

    test('CourseModel and CampaignModel parse correctly', () {
      final courseJson = {
        'id': 'crs-1',
        'organizationId': 'org-1',
        'name': 'Full-Stack TypeScript Bootcamp',
        'provider': 'thinkific'
      };
      final course = CourseModel.fromJson(courseJson);
      expect(course.name, 'Full-Stack TypeScript Bootcamp');
      expect(course.provider, 'thinkific');

      final campaignJson = {
        'id': 'cmp-1',
        'organizationId': 'org-1',
        'name': 'Winback Discount Campaign',
        'type': 'EMAIL',
        'status': 'RUNNING',
        'sentCount': 120,
        'openedCount': 45,
        'convertedCount': 12,
        'recoveredRevenue': 1500.0
      };
      final campaign = CampaignModel.fromJson(campaignJson);
      expect(campaign.name, 'Winback Discount Campaign');
      expect(campaign.sentCount, 120);
      expect(campaign.recoveredRevenue, 1500.0);
    });

    test('SubscriptionModel and IntegrationModel parse quotas and status', () {
      final subJson = {
        'planTier': 'GROWTH',
        'subscription': {'status': 'ACTIVE'},
        'usage': {'students': 250, 'courses': 5, 'emails': 1200},
        'limits': {'students': 1000, 'courses': 25, 'emails': 10000}
      };
      final sub = SubscriptionModel.fromJson(subJson);
      expect(sub.planTier, 'GROWTH');
      expect(sub.studentsUsed, 250);
      expect(sub.studentsLimit, 1000);

      final intJson = {
        'id': 'int-1',
        'organizationId': 'org-1',
        'provider': 'canvas',
        'status': 'CONNECTED'
      };
      final integration = IntegrationModel.fromJson(intJson);
      expect(integration.provider, 'canvas');
      expect(integration.status, 'CONNECTED');
    });
  });
}
