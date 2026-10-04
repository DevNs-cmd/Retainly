import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/network/api_client.dart';
import '../../../core/auth/auth_service.dart';

class CampaignModel {
  final String id;
  final String organizationId;
  final String name;
  final String type; // 'EMAIL', 'SMS', 'MIXED'
  final String status; // 'DRAFT', 'SCHEDULED', 'RUNNING', 'PAUSED', 'COMPLETED'
  final String? segment;
  final String? message;
  final bool dispatchCompleted;
  final int sentCount;
  final int openedCount;
  final int convertedCount;
  final double? recoveredRevenue;
  final DateTime? createdAt;

  CampaignModel({
    required this.id,
    required this.organizationId,
    required this.name,
    required this.type,
    required this.status,
    this.segment,
    this.message,
    this.dispatchCompleted = false,
    this.sentCount = 0,
    this.openedCount = 0,
    this.convertedCount = 0,
    this.recoveredRevenue,
    this.createdAt,
  });

  factory CampaignModel.fromJson(Map<String, dynamic> json) {
    return CampaignModel(
      id: json['id'] ?? '',
      organizationId: json['organizationId'] ?? '',
      name: json['name'] ?? 'Campaign',
      type: json['type'] ?? 'EMAIL',
      status: json['status'] ?? 'DRAFT',
      segment: json['segment'],
      message: json['message'],
      dispatchCompleted: json['dispatchCompleted'] ?? false,
      sentCount: (json['sentCount'] as num?)?.toInt() ?? (json['sent'] as num?)?.toInt() ?? 0,
      openedCount: (json['openedCount'] as num?)?.toInt() ?? (json['opened'] as num?)?.toInt() ?? 0,
      convertedCount: (json['convertedCount'] as num?)?.toInt() ?? (json['converted'] as num?)?.toInt() ?? 0,
      recoveredRevenue: (json['recoveredRevenue'] as num?)?.toDouble(),
      createdAt: json['createdAt'] != null ? DateTime.tryParse(json['createdAt']) : null,
    );
  }
}

final campaignsRepositoryProvider = Provider<CampaignsRepository>((ref) {
  final client = ref.watch(apiClientProvider);
  return CampaignsRepository(client);
});

class CampaignsRepository {
  final ApiClient _client;

  CampaignsRepository(this._client);

  Future<List<CampaignModel>> getCampaigns() async {
    final response = await _client.get('campaigns');
    if (response is List) {
      return response.map((item) => CampaignModel.fromJson(item as Map<String, dynamic>)).toList();
    }
    return [];
  }

  Future<CampaignModel> createCampaign({
    required String name,
    required String type,
    String? segment,
    String? message,
  }) async {
    final response = await _client.post('campaigns', body: {
      'name': name,
      'type': type,
      'templateId': 'tpl-default',
      if (segment != null) 'segment': segment,
      if (message != null) 'message': message,
    });
    return CampaignModel.fromJson(response as Map<String, dynamic>);
  }

  Future<void> archiveCampaign(String id) async {
    await _client.delete('campaigns/$id');
  }
}
