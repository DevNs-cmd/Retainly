import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/network/api_client.dart';
import '../../../core/auth/auth_service.dart';

class IntegrationModel {
  final String id;
  final String organizationId;
  final String provider;
  final String status;
  final DateTime? lastSyncedAt;

  IntegrationModel({
    required this.id,
    required this.organizationId,
    required this.provider,
    required this.status,
    this.lastSyncedAt,
  });

  factory IntegrationModel.fromJson(Map<String, dynamic> json) {
    return IntegrationModel(
      id: json['id'] ?? '',
      organizationId: json['organizationId'] ?? '',
      provider: json['provider'] ?? 'provider',
      status: json['status'] ?? 'CONNECTED',
      lastSyncedAt: json['lastSyncedAt'] != null ? DateTime.tryParse(json['lastSyncedAt']) : null,
    );
  }
}

final integrationsRepositoryProvider = Provider<IntegrationsRepository>((ref) {
  final client = ref.watch(apiClientProvider);
  return IntegrationsRepository(client);
});

class IntegrationsRepository {
  final ApiClient _client;

  IntegrationsRepository(this._client);

  Future<List<IntegrationModel>> getIntegrations() async {
    final response = await _client.get('integrations');
    if (response is List) {
      return response.map((item) => IntegrationModel.fromJson(item as Map<String, dynamic>)).toList();
    }
    return [];
  }

  Future<void> syncProvider(String provider) async {
    await _client.post('integrations/$provider/sync');
  }
}
