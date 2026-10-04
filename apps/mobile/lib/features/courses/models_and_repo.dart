import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/network/api_client.dart';
import '../../../core/auth/auth_service.dart';

class CourseModel {
  final String id;
  final String organizationId;
  final String name;
  final String? description;
  final String? provider;
  final String? externalId;
  final DateTime? createdAt;

  CourseModel({
    required this.id,
    required this.organizationId,
    required this.name,
    this.description,
    this.provider,
    this.externalId,
    this.createdAt,
  });

  factory CourseModel.fromJson(Map<String, dynamic> json) {
    return CourseModel(
      id: json['id'] ?? '',
      organizationId: json['organizationId'] ?? '',
      name: json['name'] ?? 'Course',
      description: json['description'],
      provider: json['provider'],
      externalId: json['externalId'],
      createdAt: json['createdAt'] != null ? DateTime.tryParse(json['createdAt']) : null,
    );
  }
}

final coursesRepositoryProvider = Provider<CoursesRepository>((ref) {
  final client = ref.watch(apiClientProvider);
  return CoursesRepository(client);
});

class CoursesRepository {
  final ApiClient _client;

  CoursesRepository(this._client);

  Future<List<CourseModel>> getCourses() async {
    final response = await _client.get('courses');
    if (response is List) {
      return response.map((item) => CourseModel.fromJson(item as Map<String, dynamic>)).toList();
    }
    return [];
  }

  Future<CourseModel> createCourse({required String name, String? description}) async {
    final response = await _client.post('courses', body: {
      'name': name,
      if (description != null) 'description': description,
    });
    return CourseModel.fromJson(response as Map<String, dynamic>);
  }
}
