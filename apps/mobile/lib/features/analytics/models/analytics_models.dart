class RiskTrendPoint {
  final String label;
  final DateTime? period;
  final int champion;
  final int lowRisk;
  final int mediumRisk;
  final int highRisk;
  final int unscored;
  final int total;
  final int retentionRate;
  final int engagementRate;
  final int atRiskCount;

  RiskTrendPoint({
    required this.label,
    this.period,
    required this.champion,
    required this.lowRisk,
    required this.mediumRisk,
    required this.highRisk,
    required this.unscored,
    required this.total,
    required this.retentionRate,
    required this.engagementRate,
    required this.atRiskCount,
  });

  factory RiskTrendPoint.fromJson(Map<String, dynamic> json, [int index = 0]) {
    final dist = (json['data'] as Map<String, dynamic>?) ?? {};
    final champion = (dist['CHAMPION'] as num?)?.toInt() ?? 0;
    final lowRisk = (dist['LOW_RISK'] as num?)?.toInt() ?? 0;
    final mediumRisk = (dist['MEDIUM_RISK'] as num?)?.toInt() ?? 0;
    final highRisk = (dist['HIGH_RISK'] as num?)?.toInt() ?? 0;
    final unscored = (dist['UNSCORED'] as num?)?.toInt() ?? 0;

    final total = champion + lowRisk + mediumRisk + highRisk + unscored;
    final retained = champion + lowRisk;
    final atRisk = mediumRisk + highRisk;

    final retRate = total > 0 ? ((retained / total) * 100).round() : 100;
    final engRate = total > 0 ? (((total - highRisk) / total) * 100).round() : 100;

    DateTime? periodDate;
    if (json['period'] != null) {
      periodDate = DateTime.tryParse(json['period']);
    }

    String dateLabel = 'Point ${index + 1}';
    if (periodDate != null) {
      dateLabel = '${periodDate.month}/${periodDate.day}';
    }

    return RiskTrendPoint(
      label: dateLabel,
      period: periodDate,
      champion: champion,
      lowRisk: lowRisk,
      mediumRisk: mediumRisk,
      highRisk: highRisk,
      unscored: unscored,
      total: total,
      retentionRate: retRate,
      engagementRate: engRate,
      atRiskCount: atRisk,
    );
  }
}

class CohortRetentionEntry {
  final dynamic period;
  final int retainedCount;
  final double rate;

  CohortRetentionEntry({
    required this.period,
    required this.retainedCount,
    required this.rate,
  });

  factory CohortRetentionEntry.fromJson(Map<String, dynamic> json) {
    return CohortRetentionEntry(
      period: json['period'],
      retainedCount: (json['retainedCount'] as num?)?.toInt() ?? 0,
      rate: (json['rate'] as num?)?.toDouble() ?? 0.0,
    );
  }
}

class CohortModel {
  final String cohortMonth;
  final int enrolledCount;
  final List<CohortRetentionEntry> retention;

  CohortModel({
    required this.cohortMonth,
    required this.enrolledCount,
    required this.retention,
  });

  factory CohortModel.fromJson(Map<String, dynamic> json) {
    final data = (json['data'] as Map<String, dynamic>?) ?? {};
    final retList = (data['retention'] as List?) ?? [];

    return CohortModel(
      cohortMonth: data['cohortMonth'] ?? json['key'] ?? 'Current',
      enrolledCount: (data['enrolledCount'] as num?)?.toInt() ?? 0,
      retention: retList.map((item) => CohortRetentionEntry.fromJson(item as Map<String, dynamic>)).toList(),
    );
  }
}

class OverviewModel {
  final double churnRate;
  final int atRiskCount;
  final int studentsSaved;
  final Map<String, dynamic> revenueAtRisk;

  OverviewModel({
    required this.churnRate,
    required this.atRiskCount,
    required this.studentsSaved,
    this.revenueAtRisk = const {},
  });

  factory OverviewModel.fromJson(Map<String, dynamic> json) {
    final data = (json['data'] as Map<String, dynamic>?) ?? json;
    return OverviewModel(
      churnRate: (data['churnRate'] as num?)?.toDouble() ?? 0.0,
      atRiskCount: (data['atRiskCount'] as num?)?.toInt() ?? 0,
      studentsSaved: (data['studentsSaved'] as num?)?.toInt() ?? 0,
      revenueAtRisk: (data['revenueAtRiskMinorByCurrency'] as Map<String, dynamic>?) ?? {},
    );
  }
}

class ActivityModel {
  final String id;
  final String studentId;
  final String activityType;
  final String source;
  final Map<String, dynamic> payload;
  final DateTime? occurredAt;
  final DateTime? createdAt;

  ActivityModel({
    required this.id,
    required this.studentId,
    required this.activityType,
    required this.source,
    this.payload = const {},
    this.occurredAt,
    this.createdAt,
  });

  String get title {
    if (payload['title'] is String && (payload['title'] as String).isNotEmpty) {
      return payload['title'];
    }
    if (payload['message'] is String && (payload['message'] as String).isNotEmpty) {
      return payload['message'];
    }
    if (payload['description'] is String && (payload['description'] as String).isNotEmpty) {
      return payload['description'];
    }
    final clean = activityType.replaceAll('_', ' ').toLowerCase();
    return clean.isNotEmpty ? '${clean[0].toUpperCase()}${clean.substring(1)} recorded via $source' : 'Activity recorded';
  }

  factory ActivityModel.fromJson(Map<String, dynamic> json) {
    return ActivityModel(
      id: json['id'] ?? '',
      studentId: json['studentId'] ?? '',
      activityType: json['activityType'] ?? 'ACTIVITY',
      source: json['source'] ?? 'telemetry',
      payload: (json['payload'] as Map<String, dynamic>?) ?? {},
      occurredAt: json['occurredAt'] != null ? DateTime.tryParse(json['occurredAt']) : null,
      createdAt: json['createdAt'] != null ? DateTime.tryParse(json['createdAt']) : null,
    );
  }
}
