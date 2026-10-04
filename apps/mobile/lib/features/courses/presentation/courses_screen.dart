import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../app/theme/colors.dart';
import '../../../shared/widgets/state_views.dart';
import '../models_and_repo.dart';

final coursesListProvider = FutureProvider.autoDispose<List<CourseModel>>((ref) async {
  final repo = ref.watch(coursesRepositoryProvider);
  return repo.getCourses();
});

class CoursesScreen extends ConsumerWidget {
  const CoursesScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final coursesAsync = ref.watch(coursesListProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Courses & Curricula'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () => ref.invalidate(coursesListProvider),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => _showAddCourseDialog(context, ref),
        child: const Icon(Icons.add),
      ),
      body: RefreshIndicator(
        onRefresh: () async {
          ref.invalidate(coursesListProvider);
          await ref.read(coursesListProvider.future);
        },
        child: coursesAsync.when(
          loading: () => const LoadingView(message: 'Loading courses...'),
          error: (err, stack) => ErrorView(
            message: 'Failed to load courses: $err',
            onRetry: () => ref.invalidate(coursesListProvider),
          ),
          data: (courses) {
            if (courses.isEmpty) {
              return EmptyStateView(
                icon: Icons.school_outlined,
                title: 'No Courses Found',
                message: 'No courses registered in this workspace yet.',
                actionLabel: 'Create Course',
                onAction: () => _showAddCourseDialog(context, ref),
              );
            }

            return ListView.separated(
              padding: const EdgeInsets.all(16),
              itemCount: courses.length,
              separatorBuilder: (_, index) => const SizedBox(height: 8),
              itemBuilder: (context, index) {
                final course = courses[index];
                return Card(
                  elevation: 0,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                    side: BorderSide(color: theme.dividerColor.withOpacity(0.2)),
                  ),
                  child: ListTile(
                    leading: const CircleAvatar(
                      backgroundColor: AppColors.indigo50,
                      child: Icon(Icons.book, color: AppColors.indigo600),
                    ),
                    title: Text(course.name, style: const TextStyle(fontWeight: FontWeight.w600)),
                    subtitle: course.description != null && course.description!.isNotEmpty
                        ? Text(course.description!, maxLines: 2, overflow: TextOverflow.ellipsis)
                        : const Text('No syllabus description', style: TextStyle(color: AppColors.slate400, fontStyle: FontStyle.italic)),
                    trailing: course.provider != null
                        ? Chip(
                            label: Text(course.provider!, style: const TextStyle(fontSize: 11)),
                            backgroundColor: AppColors.slate100,
                            padding: EdgeInsets.zero,
                          )
                        : null,
                  ),
                );
              },
            );
          },
        ),
      ),
    );
  }

  void _showAddCourseDialog(BuildContext context, WidgetRef ref) {
    final nameController = TextEditingController();
    final descController = TextEditingController();
    final formKey = GlobalKey<FormState>();
    bool isSubmitting = false;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setModalState) => Padding(
          padding: EdgeInsets.only(
            left: 20,
            right: 20,
            top: 24,
            bottom: MediaQuery.of(ctx).viewInsets.bottom + 24,
          ),
          child: Form(
            key: formKey,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const Text('Create New Course', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                const SizedBox(height: 16),
                TextFormField(
                  controller: nameController,
                  decoration: const InputDecoration(labelText: 'Course Name *', border: OutlineInputBorder()),
                  validator: (val) => val == null || val.trim().isEmpty ? 'Please enter a name' : null,
                ),
                const SizedBox(height: 12),
                TextFormField(
                  controller: descController,
                  decoration: const InputDecoration(labelText: 'Description (optional)', border: OutlineInputBorder()),
                  maxLines: 2,
                ),
                const SizedBox(height: 20),
                ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    backgroundColor: AppColors.indigo600,
                    foregroundColor: Colors.white,
                  ),
                  onPressed: isSubmitting
                      ? null
                      : () async {
                          if (!formKey.currentState!.validate()) return;
                          setModalState(() => isSubmitting = true);
                          try {
                            await ref.read(coursesRepositoryProvider).createCourse(
                                  name: nameController.text.trim(),
                                  description: descController.text.trim().isEmpty ? null : descController.text.trim(),
                                );
                            if (context.mounted) {
                              Navigator.pop(ctx);
                              ref.invalidate(coursesListProvider);
                              ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(content: Text('Course created successfully!')),
                              );
                            }
                          } catch (e) {
                            setModalState(() => isSubmitting = false);
                            if (context.mounted) {
                              ScaffoldMessenger.of(context).showSnackBar(
                                SnackBar(content: Text('Failed to create course: $e'), backgroundColor: AppColors.rose600),
                              );
                            }
                          }
                        },
                  child: isSubmitting
                      ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                      : const Text('Save Course', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
