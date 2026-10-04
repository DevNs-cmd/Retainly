import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import '../../../app/theme/colors.dart';
import '../../../shared/widgets/status_badge.dart';
import '../../../shared/widgets/state_views.dart';
import '../data/tasks_repository.dart';
import '../models/task_model.dart';

final taskStatusFilterProvider = StateProvider<String>((ref) => 'ALL');

final tasksListProvider = FutureProvider.autoDispose<List<CoachTaskModel>>((ref) async {
  final repo = ref.watch(tasksRepositoryProvider);
  return repo.getTasks();
});

class TasksScreen extends ConsumerWidget {
  const TasksScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final activeFilter = ref.watch(taskStatusFilterProvider);
    final tasksAsync = ref.watch(tasksListProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Coach Tasks & Interventions'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            tooltip: 'Refresh',
            onPressed: () => ref.invalidate(tasksListProvider),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => _showCreateTaskDialog(context, ref),
        child: const Icon(Icons.add_task),
      ),
      body: Column(
        children: [
          // Filter Chips
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            child: Row(
              children: [
                _filterChip(ref, 'ALL', 'All Tasks', activeFilter),
                const SizedBox(width: 8),
                _filterChip(ref, 'PENDING', 'Pending', activeFilter),
                const SizedBox(width: 8),
                _filterChip(ref, 'IN_PROGRESS', 'In Progress', activeFilter),
                const SizedBox(width: 8),
                _filterChip(ref, 'DONE', 'Completed', activeFilter),
              ],
            ),
          ),

          // Tasks List
          Expanded(
            child: RefreshIndicator(
              onRefresh: () async {
                ref.invalidate(tasksListProvider);
                await ref.read(tasksListProvider.future);
              },
              child: tasksAsync.when(
                loading: () => const LoadingView(message: 'Loading tasks...'),
                error: (err, stack) => ErrorView(
                  message: 'Failed to load tasks: $err',
                  onRetry: () => ref.invalidate(tasksListProvider),
                ),
                data: (tasks) {
                  final filtered = tasks.where((t) {
                    if (activeFilter == 'ALL') return true;
                    return t.status == activeFilter;
                  }).toList();

                  if (filtered.isEmpty) {
                    return EmptyStateView(
                      icon: Icons.checklist_rounded,
                      title: 'No Tasks Found',
                      message: activeFilter == 'ALL'
                          ? 'No coaching tasks or retention interventions created yet.'
                          : 'No tasks currently matching the "$activeFilter" filter.',
                      actionLabel: 'Create Task',
                      onAction: () => _showCreateTaskDialog(context, ref),
                    );
                  }

                  return ListView.separated(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                    itemCount: filtered.length,
                    separatorBuilder: (_, index) => const SizedBox(height: 8),
                    itemBuilder: (context, index) {
                      final task = filtered[index];
                      final isDone = task.isCompleted;

                      return Card(
                        elevation: 0,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                          side: BorderSide(color: theme.dividerColor.withOpacity(0.2)),
                        ),
                        child: Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                          child: CheckboxListTile(
                            contentPadding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                            controlAffinity: ListTileControlAffinity.leading,
                            value: isDone,
                            onChanged: (bool? checked) async {
                              final newStatus = checked == true ? 'DONE' : 'PENDING';
                              try {
                                await ref.read(tasksRepositoryProvider).updateTaskStatus(task.id, newStatus);
                                ref.invalidate(tasksListProvider);
                              } catch (e) {
                                if (context.mounted) {
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    SnackBar(content: Text('Failed to update task: $e'), backgroundColor: AppColors.rose600),
                                  );
                                }
                              }
                            },
                            title: Text(
                              task.title,
                              style: TextStyle(
                                fontWeight: FontWeight.w600,
                                fontSize: 15,
                                decoration: isDone ? TextDecoration.lineThrough : null,
                                color: isDone ? AppColors.slate400 : null,
                              ),
                            ),
                            subtitle: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                if (task.notes != null && task.notes!.isNotEmpty) ...[
                                  const SizedBox(height: 4),
                                  Text(
                                    task.notes!,
                                    style: TextStyle(
                                      fontSize: 13,
                                      color: isDone ? AppColors.slate400 : AppColors.slate600,
                                      decoration: isDone ? TextDecoration.lineThrough : null,
                                    ),
                                  ),
                                ],
                                const SizedBox(height: 6),
                                Wrap(
                                  spacing: 8,
                                  crossAxisAlignment: WrapCrossAlignment.center,
                                  children: [
                                    StatusBadge(status: task.status),
                                    if (task.dueDate != null)
                                      Row(
                                        mainAxisSize: MainAxisSize.min,
                                        children: [
                                          const Icon(Icons.schedule, size: 14, color: AppColors.slate400),
                                          const SizedBox(width: 4),
                                          Text(
                                            DateFormat.yMMMd().format(task.dueDate!),
                                            style: const TextStyle(fontSize: 12, color: AppColors.slate500),
                                          ),
                                        ],
                                      ),
                                  ],
                                ),
                              ],
                            ),
                          ),
                        ),
                      );
                    },
                  );
                },
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _filterChip(WidgetRef ref, String filterKey, String label, String activeFilter) {
    final isSelected = activeFilter == filterKey;
    return ChoiceChip(
      label: Text(label),
      selected: isSelected,
      onSelected: (selected) {
        if (selected) {
          ref.read(taskStatusFilterProvider.notifier).state = filterKey;
        }
      },
      selectedColor: AppColors.indigo600,
      labelStyle: TextStyle(
        color: isSelected ? Colors.white : AppColors.slate600,
        fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
        fontSize: 13,
      ),
    );
  }

  void _showCreateTaskDialog(BuildContext context, WidgetRef ref) {
    final titleController = TextEditingController();
    final notesController = TextEditingController();
    final formKey = GlobalKey<FormState>();
    DateTime? selectedDueDate;
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
            child: SingleChildScrollView(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  const Text('New Coaching Intervention', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 16),
                  TextFormField(
                    controller: titleController,
                    decoration: const InputDecoration(labelText: 'Task Title *', border: OutlineInputBorder()),
                    validator: (val) => val == null || val.trim().isEmpty ? 'Please enter a task title' : null,
                  ),
                  const SizedBox(height: 12),
                  TextFormField(
                    controller: notesController,
                    decoration: const InputDecoration(labelText: 'Notes / Action Items', border: OutlineInputBorder()),
                    maxLines: 2,
                  ),
                  const SizedBox(height: 12),
                  ListTile(
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(8),
                      side: const BorderSide(color: AppColors.slate200),
                    ),
                    leading: const Icon(Icons.calendar_today, color: AppColors.indigo600),
                    title: Text(
                      selectedDueDate == null ? 'Set Due Date (Optional)' : DateFormat.yMMMd().format(selectedDueDate!),
                      style: TextStyle(
                        fontSize: 14,
                        color: selectedDueDate == null ? AppColors.slate500 : AppColors.slate800,
                      ),
                    ),
                    trailing: selectedDueDate != null
                        ? IconButton(
                            icon: const Icon(Icons.clear, size: 20),
                            onPressed: () => setModalState(() => selectedDueDate = null),
                          )
                        : null,
                    onTap: () async {
                      final picked = await showDatePicker(
                        context: context,
                        initialDate: DateTime.now().add(const Duration(days: 3)),
                        firstDate: DateTime.now(),
                        lastDate: DateTime.now().add(const Duration(days: 365)),
                      );
                      if (picked != null) {
                        setModalState(() => selectedDueDate = picked);
                      }
                    },
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
                              await ref.read(tasksRepositoryProvider).createTask(
                                    title: titleController.text.trim(),
                                    notes: notesController.text.trim().isEmpty ? null : notesController.text.trim(),
                                    dueDate: selectedDueDate,
                                  );
                              if (context.mounted) {
                                Navigator.pop(ctx);
                                ref.invalidate(tasksListProvider);
                                ScaffoldMessenger.of(context).showSnackBar(
                                  const SnackBar(content: Text('Intervention task created successfully!')),
                                );
                              }
                            } catch (e) {
                              setModalState(() => isSubmitting = false);
                              if (context.mounted) {
                                ScaffoldMessenger.of(context).showSnackBar(
                                  SnackBar(content: Text('Failed to create task: $e'), backgroundColor: AppColors.rose600),
                                );
                              }
                            }
                          },
                    child: isSubmitting
                        ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                        : const Text('Create Task', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
