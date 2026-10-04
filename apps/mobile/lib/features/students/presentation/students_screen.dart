import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../app/theme/colors.dart';
import '../../../shared/widgets/risk_badge.dart';
import '../../../shared/widgets/state_views.dart';
import '../data/students_repository.dart';
import '../models/student_model.dart';
import 'student_detail_screen.dart';

final studentFilterRiskProvider = StateProvider<String>((ref) => 'ALL');
final studentSearchQueryProvider = StateProvider<String>((ref) => '');

final studentsListProvider = FutureProvider.autoDispose<List<StudentModel>>((ref) async {
  final repo = ref.watch(studentsRepositoryProvider);
  final search = ref.watch(studentSearchQueryProvider);
  return repo.getStudents(search: search.trim().isEmpty ? null : search.trim());
});

class StudentsScreen extends ConsumerStatefulWidget {
  const StudentsScreen({super.key});

  @override
  ConsumerState<StudentsScreen> createState() => _StudentsScreenState();
}

class _StudentsScreenState extends ConsumerState<StudentsScreen> {
  final TextEditingController _searchController = TextEditingController();

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final activeFilter = ref.watch(studentFilterRiskProvider);
    final studentsAsync = ref.watch(studentsListProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Students Directory'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            tooltip: 'Refresh',
            onPressed: () => ref.invalidate(studentsListProvider),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => _showAddStudentDialog(context),
        child: const Icon(Icons.person_add),
      ),
      body: Column(
        children: [
          // Search & Filter Header
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 8),
            child: TextField(
              controller: _searchController,
              decoration: InputDecoration(
                hintText: 'Search by student name or email...',
                prefixIcon: const Icon(Icons.search),
                suffixIcon: _searchController.text.isNotEmpty
                    ? IconButton(
                        icon: const Icon(Icons.clear),
                        onPressed: () {
                          _searchController.clear();
                          ref.read(studentSearchQueryProvider.notifier).state = '';
                        },
                      )
                    : null,
                contentPadding: const EdgeInsets.symmetric(vertical: 0, horizontal: 16),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
              ),
              onSubmitted: (val) {
                ref.read(studentSearchQueryProvider.notifier).state = val;
              },
            ),
          ),

          // Risk Filter Chips
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
            child: Row(
              children: [
                _filterChip('ALL', 'All Students', activeFilter),
                const SizedBox(width: 8),
                _filterChip('HIGH', 'High Risk', activeFilter),
                const SizedBox(width: 8),
                _filterChip('MEDIUM', 'Medium Risk', activeFilter),
                const SizedBox(width: 8),
                _filterChip('LOW', 'Low Risk', activeFilter),
              ],
            ),
          ),

          const SizedBox(height: 8),

          // Student List
          Expanded(
            child: RefreshIndicator(
              onRefresh: () async {
                ref.invalidate(studentsListProvider);
                await ref.read(studentsListProvider.future);
              },
              child: studentsAsync.when(
                loading: () => const LoadingView(message: 'Loading students...'),
                error: (err, stack) => ErrorView(
                  message: 'Failed to load students: $err',
                  onRetry: () => ref.invalidate(studentsListProvider),
                ),
                data: (students) {
                  // Apply client-side risk filtering
                  final filtered = students.where((s) {
                    if (activeFilter == 'ALL') return true;
                    return s.riskLevel == activeFilter;
                  }).toList();

                  if (filtered.isEmpty) {
                    return EmptyStateView(
                      icon: Icons.people_outline,
                      title: 'No Students Found',
                      message: activeFilter == 'ALL'
                          ? 'No student profiles recorded yet. Tap + to enroll a student.'
                          : 'No students matching the "$activeFilter" risk criteria.',
                      actionLabel: 'Add Student',
                      onAction: () => _showAddStudentDialog(context),
                    );
                  }

                  return ListView.separated(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                    itemCount: filtered.length,
                    separatorBuilder: (_, index) => const SizedBox(height: 8),
                    itemBuilder: (context, index) {
                      final student = filtered[index];
                      return Card(
                        elevation: 0,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                          side: BorderSide(color: theme.dividerColor.withOpacity(0.2)),
                        ),
                        child: ListTile(
                          contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
                          leading: CircleAvatar(
                            backgroundColor: AppColors.indigo100,
                            child: Text(
                              student.name.isNotEmpty ? student.name[0].toUpperCase() : '?',
                              style: const TextStyle(fontWeight: FontWeight.bold, color: AppColors.indigo600),
                            ),
                          ),
                          title: Text(
                            student.name,
                            style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 15),
                          ),
                          subtitle: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const SizedBox(height: 2),
                              Text(student.email, style: const TextStyle(fontSize: 13, color: AppColors.slate500)),
                              const SizedBox(height: 6),
                              RiskBadge(level: student.riskLevel, score: student.normalizedScore),
                            ],
                          ),
                          trailing: const Icon(Icons.chevron_right, color: AppColors.slate400),
                          onTap: () async {
                            final changed = await Navigator.push<bool>(
                              context,
                              MaterialPageRoute(
                                builder: (_) => StudentDetailScreen(initialStudent: student),
                              ),
                            );
                            if (changed == true) {
                              ref.invalidate(studentsListProvider);
                            }
                          },
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

  Widget _filterChip(String filterKey, String label, String activeFilter) {
    final isSelected = activeFilter == filterKey;
    return ChoiceChip(
      label: Text(label),
      selected: isSelected,
      onSelected: (selected) {
        if (selected) {
          ref.read(studentFilterRiskProvider.notifier).state = filterKey;
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

  void _showAddStudentDialog(BuildContext context) {
    final nameController = TextEditingController();
    final emailController = TextEditingController();
    final phoneController = TextEditingController();
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
            child: SingleChildScrollView(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  const Text('Enroll New Student', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 16),
                  TextFormField(
                    controller: nameController,
                    decoration: const InputDecoration(labelText: 'Full Name *', border: OutlineInputBorder()),
                    validator: (val) => val == null || val.trim().isEmpty ? 'Please enter a name' : null,
                  ),
                  const SizedBox(height: 12),
                  TextFormField(
                    controller: emailController,
                    decoration: const InputDecoration(labelText: 'Email Address *', border: OutlineInputBorder()),
                    keyboardType: TextInputType.emailAddress,
                    validator: (val) => val == null || !val.contains('@') ? 'Please enter a valid email' : null,
                  ),
                  const SizedBox(height: 12),
                  TextFormField(
                    controller: phoneController,
                    decoration: const InputDecoration(labelText: 'Phone (optional)', border: OutlineInputBorder()),
                    keyboardType: TextInputType.phone,
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
                              await ref.read(studentsRepositoryProvider).createStudent(
                                    name: nameController.text.trim(),
                                    email: emailController.text.trim(),
                                    phone: phoneController.text.trim().isEmpty ? null : phoneController.text.trim(),
                                  );
                              if (context.mounted) {
                                Navigator.pop(ctx);
                                ref.invalidate(studentsListProvider);
                                ScaffoldMessenger.of(context).showSnackBar(
                                  const SnackBar(content: Text('Student successfully enrolled!')),
                                );
                              }
                            } catch (e) {
                              setModalState(() => isSubmitting = false);
                              if (context.mounted) {
                                ScaffoldMessenger.of(context).showSnackBar(
                                  SnackBar(content: Text('Failed to enroll student: $e'), backgroundColor: AppColors.rose600),
                                );
                              }
                            }
                          },
                    child: isSubmitting
                        ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                        : const Text('Enroll Student', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
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
