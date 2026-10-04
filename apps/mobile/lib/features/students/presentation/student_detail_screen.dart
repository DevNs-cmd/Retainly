import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import '../../../app/theme/colors.dart';
import '../../../shared/widgets/risk_badge.dart';
import '../../../shared/widgets/state_views.dart';
import '../data/students_repository.dart';
import '../models/student_model.dart';

final studentDetailProvider = FutureProvider.autoDispose.family<StudentModel?, String>((ref, id) async {
  final repo = ref.watch(studentsRepositoryProvider);
  return repo.getStudentById(id);
});

class StudentDetailScreen extends ConsumerWidget {
  final StudentModel initialStudent;

  const StudentDetailScreen({super.key, required this.initialStudent});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final detailAsync = ref.watch(studentDetailProvider(initialStudent.id));
    final student = detailAsync.value ?? initialStudent;

    return Scaffold(
      appBar: AppBar(
        title: Text(student.name),
        actions: [
          IconButton(
            icon: const Icon(Icons.delete_outline, color: AppColors.rose600),
            tooltip: 'Delete Student',
            onPressed: () => _confirmDelete(context, ref, student),
          ),
        ],
      ),
      body: detailAsync.when(
        loading: () => const LoadingView(message: 'Loading details...'),
        error: (err, stack) => ErrorView(
          message: 'Failed to load details: $err',
          onRetry: () => ref.invalidate(studentDetailProvider(initialStudent.id)),
        ),
        data: (studentData) {
          final s = studentData ?? initialStudent;
          return ListView(
            padding: const EdgeInsets.all(16.0),
            children: [
              // Header Card
              Card(
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                child: Padding(
                  padding: const EdgeInsets.all(20.0),
                  child: Column(
                    children: [
                      CircleAvatar(
                        radius: 36,
                        backgroundColor: AppColors.indigo100,
                        child: Text(
                          s.name.isNotEmpty ? s.name[0].toUpperCase() : '?',
                          style: const TextStyle(fontSize: 28, fontWeight: FontWeight.bold, color: AppColors.indigo600),
                        ),
                      ),
                      const SizedBox(height: 12),
                      Text(s.name, style: theme.textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold)),
                      const SizedBox(height: 4),
                      Text(s.email, style: theme.textTheme.bodyMedium?.copyWith(color: AppColors.slate500)),
                      const SizedBox(height: 16),
                      Wrap(
                        spacing: 8,
                        children: [
                          RiskBadge(level: s.riskLevel, score: s.normalizedScore),
                          if (s.segment != null)
                            Chip(
                              label: Text(s.segment!, style: const TextStyle(fontSize: 12)),
                              backgroundColor: AppColors.slate100,
                              padding: EdgeInsets.zero,
                            ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),

              const SizedBox(height: 16),

              // Student Overview & Metrics
              Card(
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Student Information', style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold)),
                      const Divider(height: 24),
                      _infoRow('Email', s.email, Icons.email_outlined),
                      const SizedBox(height: 12),
                      _infoRow('Phone', s.phone ?? 'Not provided', Icons.phone_outlined),
                      const SizedBox(height: 12),
                      _infoRow('Student ID', s.id, Icons.badge_outlined),
                      if (s.createdAt != null) ...[
                        const SizedBox(height: 12),
                        _infoRow('Enrolled On', DateFormat.yMMMd().format(s.createdAt!), Icons.calendar_today_outlined),
                      ],
                    ],
                  ),
                ),
              ),

              const SizedBox(height: 16),

              // AI Risk Insights Card
              Card(
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          const Icon(Icons.analytics_outlined, color: AppColors.indigo600),
                          const SizedBox(width: 8),
                          Text('AI Retention Analysis', style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold)),
                        ],
                      ),
                      const Divider(height: 24),
                      Text(
                        'Risk Probability Score: ${s.normalizedScore}%',
                        style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 15),
                      ),
                      const SizedBox(height: 8),
                      ClipRRect(
                        borderRadius: BorderRadius.circular(6),
                        child: LinearProgressIndicator(
                          value: s.normalizedScore / 100.0,
                          minHeight: 8,
                          backgroundColor: AppColors.slate200,
                          valueColor: AlwaysStoppedAnimation<Color>(
                            s.normalizedScore >= 70
                                ? AppColors.rose600
                                : s.normalizedScore >= 50
                                    ? AppColors.amber500
                                    : AppColors.emerald600,
                          ),
                        ),
                      ),
                      const SizedBox(height: 16),
                      if (s.reasons.isNotEmpty) ...[
                        const Text('Identified Risk Factors:', style: TextStyle(fontWeight: FontWeight.w600)),
                        const SizedBox(height: 8),
                        ...s.reasons.map((reason) => Padding(
                              padding: const EdgeInsets.only(bottom: 6),
                              child: Row(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  const Icon(Icons.warning_amber_rounded, size: 18, color: AppColors.amber500),
                                  const SizedBox(width: 8),
                                  Expanded(child: Text(reason, style: theme.textTheme.bodyMedium)),
                                ],
                              ),
                            )),
                      ] else ...[
                        const Text(
                          'No critical risk factors currently flagged by the AI model.',
                          style: TextStyle(color: AppColors.slate500, fontStyle: FontStyle.italic),
                        ),
                      ],
                    ],
                  ),
                ),
              ),
            ],
          );
        },
      ),
    );
  }

  Widget _infoRow(String label, String value, IconData icon) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        Icon(icon, size: 20, color: AppColors.slate400),
        const SizedBox(width: 12),
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(label, style: const TextStyle(fontSize: 12, color: AppColors.slate400)),
            Text(value, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w500)),
          ],
        ),
      ],
    );
  }

  void _confirmDelete(BuildContext context, WidgetRef ref, StudentModel student) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Delete Student'),
        content: Text('Are you sure you want to remove ${student.name}? This action cannot be undone.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.rose600, foregroundColor: Colors.white),
            onPressed: () async {
              Navigator.pop(ctx);
              try {
                await ref.read(studentsRepositoryProvider).deleteStudent(student.id);
                if (context.mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text('Student ${student.name} deleted successfully.')),
                  );
                  Navigator.pop(context, true); // Return true to trigger refresh
                }
              } catch (e) {
                if (context.mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text('Failed to delete student: $e'), backgroundColor: AppColors.rose600),
                  );
                }
              }
            },
            child: const Text('Delete'),
          ),
        ],
      ),
    );
  }
}
