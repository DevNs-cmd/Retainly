import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/network/api_client.dart';
import '../../../core/auth/auth_service.dart';
import '../models/analytics_models.dart';

final analyticsRepositoryProvider = Provider<AnalyticsRepository>((ref) {
  final client = ref.watch(apiClientProvider);
  return AnalyticsRepository(client);
});

class AnalyticsRepository {
  final ApiClient _client;

  AnalyticsRepository(this._client);

  Future<List<RiskTrendPoint>> getRiskTrends() async {
    final response = await _client.get('analytics/risk-trends');
    if (response is List) {
      final list = response
          .asMap()
          .entries
          .map((entry) => RiskTrendPoint.fromJson(entry.value as Map<String, dynamic>, entry.key))
          .toList();

      // Sort chronologically ascending
      list.sort((a, b) {
        if (a.period == null) return -1;
        if (b.period == null) return 1;
        return a.period!.compareTo(b.period!);
      });
      return list;
    }
    return [];
  }

  Future<List<CohortModel>> getCohorts() async {
    final response = await _client.get('analytics/cohorts');
    if (response is List) {
      final list = response
          .map((item) => CohortModel.fromJson(item as Map<String, dynamic>))
          .toList();
      list.sort((a, b) => a.cohortMonth.compareTo(b.cohortMonth));
      return list;
    } else if (response is Map<String, dynamic>) {
      return [CohortModel.fromJson(response)];
    }
    return [];
  }

  Future<OverviewModel?> getOverview() async {
    final response = await _client.get('analytics/overview');
    if (response is List && response.isNotEmpty) {
      return OverviewModel.fromJson(response[0] as Map<String, dynamic>);
    } else if (response is Map<String, dynamic>) {
      return OverviewModel.fromJson(response);
    }
    return null;
  }

  Future<List<ActivityModel>> getActivities({int limit = 10}) async {
    final response = await _client.get('activities', queryParams: {'limit': limit});
    if (response is Map<String, dynamic> && response['data'] is List) {
      return (response['data'] as List)
          .map((item) => ActivityModel.fromJson(item as Map<String, dynamic>))
          .toList();
    } else if (response is List) {
      return response
          .map((item) => ActivityModel.fromJson(item as Map<String, dynamic>))
          .toList();
    }
    return [];
  }
}
