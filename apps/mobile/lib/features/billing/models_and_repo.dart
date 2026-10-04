import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/network/api_client.dart';
import '../../../core/auth/auth_service.dart';

class SubscriptionModel {
  final String planTier;
  final String status;
  final int studentsUsed;
  final int studentsLimit;
  final int coursesUsed;
  final int coursesLimit;
  final int emailsUsed;
  final int emailsLimit;

  SubscriptionModel({
    required this.planTier,
    required this.status,
    required this.studentsUsed,
    required this.studentsLimit,
    required this.coursesUsed,
    required this.coursesLimit,
    required this.emailsUsed,
    required this.emailsLimit,
  });

  factory SubscriptionModel.fromJson(Map<String, dynamic> json) {
    final sub = (json['subscription'] as Map<String, dynamic>?) ?? {};
    final usage = (json['usage'] as Map<String, dynamic>?) ?? {};
    final limits = (json['limits'] as Map<String, dynamic>?) ?? {};

    return SubscriptionModel(
      planTier: json['planTier'] ?? 'STARTER',
      status: sub['status'] ?? 'ACTIVE',
      studentsUsed: (usage['students'] as num?)?.toInt() ?? 0,
      studentsLimit: (limits['students'] as num?)?.toInt() ?? 1000,
      coursesUsed: (usage['courses'] as num?)?.toInt() ?? 0,
      coursesLimit: (limits['courses'] as num?)?.toInt() ?? 25,
      emailsUsed: (usage['emails'] as num?)?.toInt() ?? 0,
      emailsLimit: (limits['emails'] as num?)?.toInt() ?? 10000,
    );
  }
}

final billingRepositoryProvider = Provider<BillingRepository>((ref) {
  final client = ref.watch(apiClientProvider);
  return BillingRepository(client);
});

class BillingRepository {
  final ApiClient _client;

  BillingRepository(this._client);

  Future<SubscriptionModel> getSubscription() async {
    final response = await _client.get('billing/subscription');
    return SubscriptionModel.fromJson(response as Map<String, dynamic>);
  }

  Future<String?> createCheckout(String planTier, String requestId) async {
    final response = await _client.post('billing/checkout', body: {
      'planTier': planTier,
      'requestId': requestId,
    });
    if (response is Map<String, dynamic>) {
      return response['url'] as String?;
    }
    return null;
  }

  Future<String?> createPortal() async {
    final response = await _client.post('billing/portal');
    if (response is Map<String, dynamic>) {
      return response['url'] as String?;
    }
    return null;
  }
}
