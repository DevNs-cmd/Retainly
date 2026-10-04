import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/network/api_client.dart';
import '../../../core/auth/auth_service.dart';
import '../models/student_model.dart';

final studentsRepositoryProvider = Provider<StudentsRepository>((ref) {
  final client = ref.watch(apiClientProvider);
  return StudentsRepository(client);
});

class StudentsRepository {
  final ApiClient _client;

  StudentsRepository(this._client);

  Future<List<StudentModel>> getStudents({int page = 1, int limit = 50, String? search}) async {
    final params = <String, dynamic>{
      'page': page,
      'limit': limit,
    };
    if (search != null && search.isNotEmpty) {
      params['search'] = search;
    }

    final response = await _client.get('students', queryParams: params);
    if (response is Map<String, dynamic>) {
      return PaginatedStudents.fromJson(response).data;
    } else if (response is List) {
      return response.map((item) => StudentModel.fromJson(item as Map<String, dynamic>)).toList();
    }
    return [];
  }

  Future<StudentModel?> getStudentById(String id) async {
    final response = await _client.get('students/$id');
    if (response is Map<String, dynamic>) {
      return StudentModel.fromJson(response);
    }
    return null;
  }

  Future<List<StudentModel>> getAtRiskStudents() async {
    final response = await _client.get('students/at-risk');
    if (response is Map<String, dynamic>) {
      return PaginatedStudents.fromJson(response).data;
    } else if (response is List) {
      return response.map((item) => StudentModel.fromJson(item as Map<String, dynamic>)).toList();
    }
    return [];
  }

  Future<StudentModel> createStudent({
    required String name,
    required String email,
    String? phone,
    String? assignedCoachId,
  }) async {
    final response = await _client.post('students', body: {
      'name': name,
      'email': email,
      if (phone != null && phone.isNotEmpty) 'phone': phone,
      if (assignedCoachId != null && assignedCoachId.isNotEmpty) 'assignedCoachId': assignedCoachId,
    });

    return StudentModel.fromJson(response as Map<String, dynamic>);
  }

  Future<void> deleteStudent(String id) async {
    await _client.delete('students/$id');
  }
}
