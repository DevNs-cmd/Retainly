class StudentModel {
  final String id;
  final String organizationId;
  final String name;
  final String email;
  final String? phone;
  final String? provider;
  final String? externalId;
  final String? assignedCoachId;
  final String? segment; // 'HIGH_RISK', 'MEDIUM_RISK', 'LOW_RISK', 'CHAMPION', null
  final int? riskScore;
  final DateTime? createdAt;
  final DateTime? updatedAt;
  final List<String> reasons;

  StudentModel({
    required this.id,
    required this.organizationId,
    required this.name,
    required this.email,
    this.phone,
    this.provider,
    this.externalId,
    this.assignedCoachId,
    this.segment,
    this.riskScore,
    this.createdAt,
    this.updatedAt,
    this.reasons = const [],
  });

  String get riskLevel {
    if (segment == 'HIGH_RISK') return 'HIGH';
    if (segment == 'MEDIUM_RISK') return 'MEDIUM';
    if (segment == 'LOW_RISK' || segment == 'CHAMPION') return 'LOW';
    if ((riskScore ?? 0) >= 70) return 'HIGH';
    if ((riskScore ?? 0) >= 50) return 'MEDIUM';
    return 'LOW';
  }

  int get normalizedScore {
    if (riskScore != null) {
      return riskScore! <= 1 ? (riskScore! * 100).round() : riskScore!;
    }
    return 25;
  }

  factory StudentModel.fromJson(Map<String, dynamic> json) {
    List<String> parsedReasons = [];
    if (json['latestRiskSnapshot'] is Map && json['latestRiskSnapshot']['reasons'] is List) {
      parsedReasons = (json['latestRiskSnapshot']['reasons'] as List).map((r) => r.toString()).toList();
    }

    return StudentModel(
      id: json['id'] ?? '',
      organizationId: json['organizationId'] ?? '',
      name: json['name'] ?? 'Unnamed Student',
      email: json['email'] ?? '',
      phone: json['phone'],
      provider: json['provider'],
      externalId: json['externalId'],
      assignedCoachId: json['assignedCoachId'],
      segment: json['segment'],
      riskScore: json['riskScore'] != null ? (json['riskScore'] as num).toInt() : null,
      createdAt: json['createdAt'] != null ? DateTime.tryParse(json['createdAt']) : null,
      updatedAt: json['updatedAt'] != null ? DateTime.tryParse(json['updatedAt']) : null,
      reasons: parsedReasons,
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'organizationId': organizationId,
    'name': name,
    'email': email,
    'phone': phone,
    'assignedCoachId': assignedCoachId,
    'segment': segment,
    'riskScore': riskScore,
  };
}

class PaginatedStudents {
  final List<StudentModel> data;
  final int total;
  final int page;
  final int limit;

  PaginatedStudents({
    required this.data,
    required this.total,
    required this.page,
    required this.limit,
  });

  factory PaginatedStudents.fromJson(Map<String, dynamic> json) {
    final list = (json['data'] as List?) ?? [];
    return PaginatedStudents(
      data: list.map((item) => StudentModel.fromJson(item as Map<String, dynamic>)).toList(),
      total: json['total'] ?? list.length,
      page: json['page'] ?? 1,
      limit: json['limit'] ?? 50,
    );
  }
}
