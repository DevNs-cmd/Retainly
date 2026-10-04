class CoachTaskModel {
  final String id;
  final String organizationId;
  final String studentId;
  final String title;
  final String? notes;
  final String status; // 'PENDING', 'IN_PROGRESS', 'DONE', 'SNOOZED'
  final DateTime? dueDate;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  CoachTaskModel({
    required this.id,
    required this.organizationId,
    required this.studentId,
    required this.title,
    this.notes,
    required this.status,
    this.dueDate,
    this.createdAt,
    this.updatedAt,
  });

  bool get isCompleted => status == 'DONE';

  factory CoachTaskModel.fromJson(Map<String, dynamic> json) {
    return CoachTaskModel(
      id: json['id'] ?? '',
      organizationId: json['organizationId'] ?? '',
      studentId: json['studentId'] ?? '',
      title: json['title'] ?? 'Task',
      notes: json['notes'],
      status: json['status'] ?? 'PENDING',
      dueDate: json['dueDate'] != null ? DateTime.tryParse(json['dueDate']) : null,
      createdAt: json['createdAt'] != null ? DateTime.tryParse(json['createdAt']) : null,
      updatedAt: json['updatedAt'] != null ? DateTime.tryParse(json['updatedAt']) : null,
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'studentId': studentId,
    'title': title,
    'notes': notes,
    'status': status,
    'dueDate': dueDate?.toIso8601String(),
  };
}
