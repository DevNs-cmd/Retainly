import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/network/api_client.dart';
import '../../../core/auth/auth_service.dart';
import '../models/task_model.dart';

final tasksRepositoryProvider = Provider<TasksRepository>((ref) {
  final client = ref.watch(apiClientProvider);
  return TasksRepository(client);
});

class TasksRepository {
  final ApiClient _client;

  TasksRepository(this._client);

  Future<List<CoachTaskModel>> getTasks() async {
    final response = await _client.get('coach-tasks');
    if (response is List) {
      return response.map((item) => CoachTaskModel.fromJson(item as Map<String, dynamic>)).toList();
    }
    return [];
  }

  Future<CoachTaskModel> createTask({
    required String title,
    String? studentId,
    String? notes,
    DateTime? dueDate,
  }) async {
    final response = await _client.post('coach-tasks', body: {
      'title': title,
      if (studentId != null && studentId.isNotEmpty) 'studentId': studentId,
      if (notes != null && notes.isNotEmpty) 'notes': notes,
      if (dueDate != null) 'dueDate': dueDate.toIso8601String(),
    });
    return CoachTaskModel.fromJson(response as Map<String, dynamic>);
  }

  Future<CoachTaskModel> updateTaskStatus(String id, String status) async {
    final response = await _client.patch('coach-tasks/$id', body: {
      'status': status,
    });
    return CoachTaskModel.fromJson(response as Map<String, dynamic>);
  }
}
