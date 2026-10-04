import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../shared/widgets/kpi_card_widget.dart';
import '../../../shared/widgets/risk_badge.dart';
import '../../../shared/widgets/state_views.dart';
import '../../analytics/data/analytics_repository.dart';
import '../../analytics/models/analytics_models.dart';
import '../../students/data/students_repository.dart';
import '../../students/models/student_model.dart';
import '../../tasks/data/tasks_repository.dart';
import '../../tasks/models/task_model.dart';
import '../../campaigns/models_and_repo.dart';

// Dashboard Data Bundle Provider
final dashboardDataProvider = FutureProvider.autoDispose((ref) async {
  final analyticsRepo = ref.watch(analyticsRepositoryProvider);
  final studentsRepo = ref.watch(studentsRepositoryProvider);
  final tasksRepo = ref.watch(tasksRepositoryProvider);
  final campaignsRepo = ref.watch(campaignsRepositoryProvider);

  final results = await Future.wait([
    analyticsRepo.getRiskTrends().catchError((_) => <RiskTrendPoint>[]),
    analyticsRepo.getOverview().catchError((_) => null),
    analyticsRepo.getActivities(limit: 5).catchError((_) => <ActivityModel>[]),
    studentsRepo.getStudents(limit: 50).catchError((_) => <StudentModel>[]),
    tasksRepo.getTasks().catchError((_) => <CoachTaskModel>[]),
    campaignsRepo.getCampaigns().catchError((_) => <CampaignModel>[]),
  ]);

  return {
    'riskTrends': results[0] as List<RiskTrendPoint>,
    'overview': results[1] as OverviewModel?,
    'activities': results[2] as List<ActivityModel>,
    'students': results[3] as List<StudentModel>,
    'tasks': results[4] as List<CoachTaskModel>,
    'campaigns': results[5] as List<CampaignModel>,
  };
});

class DashboardScreen extends ConsumerWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final dashboardAsync = ref.watch(dashboardDataProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Row(
          children: [
            Icon(Icons.shield_rounded, size: 22, color: Color(0xFF4F46E5)),
            SizedBox(width: 8),
            Text('Retainly Dashboard'),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh_rounded),
            onPressed: () => ref.refresh(dashboardDataProvider),
          ),
        ],
      ),
      body: dashboardAsync.when(
        loading: () => const LoadingView(message: 'Loading intelligence dashboard...'),
        error: (err, _) => ErrorView(
          message: err.toString(),
          onRetry: () => ref.refresh(dashboardDataProvider),
        ),
        data: (data) {
          final students = data['students'] as List<StudentModel>;
          final riskTrends = data['riskTrends'] as List<RiskTrendPoint>;
          final overview = data['overview'] as OverviewModel?;
          final activities = data['activities'] as List<ActivityModel>;
          final tasks = data['tasks'] as List<CoachTaskModel>;
          final campaigns = data['campaigns'] as List<CampaignModel>;

          final totalStudents = students.length;
          final atRiskCount = overview?.atRiskCount ??
              students.where((s) => (s.riskScore ?? 0) >= 50 || s.riskLevel == 'HIGH').length;
          final criticalCount = students.where((s) => (s.riskScore ?? 0) >= 85).length;
          final retentionRate = totalStudents > 0
              ? (((totalStudents - atRiskCount) / totalStudents) * 100).round()
              : 100;
          final recoveredRevenue = campaigns.fold<double>(
              0.0, (sum, c) => sum + (c.recoveredRevenue ?? 0.0));

          final atRiskStudents = students.where((s) => (s.riskScore ?? 0) >= 50).take(5).toList();
          final pendingTasks = tasks.where((t) => !t.isCompleted).take(4).toList();

          return RefreshIndicator(
            onRefresh: () async => ref.refresh(dashboardDataProvider),
            child: ListView(
              padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 12.0),
              children: [
                // Header Greeting
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'Good morning,',
                          style: TextStyle(fontSize: 14, color: Colors.grey),
                        ),
                        Text(
                          'Workspace Coach',
                          style: TextStyle(
                            fontSize: 20,
                            fontWeight: FontWeight.bold,
                            color: Theme.of(context).colorScheme.secondary,
                          ),
                        ),
                      ],
                    ),
                    Chip(
                      label: const Text('Live Workspace', style: TextStyle(fontSize: 11)),
                      backgroundColor: Theme.of(context).primaryColor.withOpacity(0.08),
                    ),
                  ],
                ),
                const SizedBox(height: 16),

                // 4 KPI Cards Grid
                GridView.count(
                  crossAxisCount: 2,
                  crossAxisSpacing: 10,
                  mainAxisSpacing: 10,
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  children: [
                    KpiCardWidget(
                      title: 'Students at Risk',
                      value: atRiskCount.toString(),
                      change: criticalCount > 0 ? '$criticalCount critical' : 'Stabilized',
                      isPositive: atRiskCount == 0,
                      icon: Icons.people_outline_rounded,
                      iconColor: const Color(0xFFEF4444),
                    ),
                    KpiCardWidget(
                      title: 'Retention Rate',
                      value: '$retentionRate%',
                      change: 'Active cohort',
                      isPositive: true,
                      icon: Icons.shield_outlined,
                      iconColor: const Color(0xFF10B981),
                    ),
                    KpiCardWidget(
                      title: 'Revenue at Risk',
                      value: '\$${(atRiskCount * 150).toString()}',
                      change: 'Estimated exposure',
                      isPositive: atRiskCount == 0,
                      icon: Icons.attach_money_rounded,
                      iconColor: const Color(0xFFF59E0B),
                    ),
                    KpiCardWidget(
                      title: 'Recovered Revenue',
                      value: '\$${recoveredRevenue.toInt().toString()}',
                      change: 'Saved via AI',
                      isPositive: true,
                      icon: Icons.trending_up_rounded,
                      iconColor: const Color(0xFF4F46E5),
                    ),
                  ],
                ),
                const SizedBox(height: 16),

                // Retention & Engagement Trend Card
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              'Retention & Engagement',
                              style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
                            ),
                            Text(
                              'AI History',
                              style: TextStyle(fontSize: 11, color: Colors.grey),
                            ),
                          ],
                        ),
                        const SizedBox(height: 12),
                        if (riskTrends.isEmpty)
                          const Padding(
                            padding: EdgeInsets.symmetric(vertical: 24.0),
                            child: Center(
                              child: Text(
                                'No historical risk snapshots recorded yet.',
                                style: TextStyle(fontSize: 12, color: Colors.grey),
                              ),
                            ),
                          )
                        else ...[
                          SizedBox(
                            height: 110,
                            child: Row(
                              crossAxisAlignment: CrossAxisAlignment.end,
                              mainAxisAlignment: MainAxisAlignment.spaceAround,
                              children: riskTrends.map((pt) {
                                final barHeight = (pt.retentionRate / 100) * 80;
                                return Column(
                                  mainAxisAlignment: MainAxisAlignment.end,
                                  children: [
                                    Text(
                                      '${pt.retentionRate}%',
                                      style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold),
                                    ),
                                    const SizedBox(height: 4),
                                    Container(
                                      width: 28,
                                      height: barHeight,
                                      decoration: BoxDecoration(
                                        color: const Color(0xFFF59E0B),
                                        borderRadius: BorderRadius.circular(6),
                                      ),
                                    ),
                                    const SizedBox(height: 6),
                                    Text(
                                      pt.label,
                                      style: const TextStyle(fontSize: 10, color: Colors.grey),
                                    ),
                                  ],
                                );
                              }).toList(),
                            ),
                          ),
                        ],
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 16),

                // Recent Activity Live Feed
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              'Recent Activity',
                              style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
                            ),
                            Text(
                              'Live Feed',
                              style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF4F46E5)),
                            ),
                          ],
                        ),
                        const SizedBox(height: 12),
                        if (activities.isEmpty)
                          const Padding(
                            padding: EdgeInsets.symmetric(vertical: 16.0),
                            child: Text(
                              'No recent activity recorded yet.',
                              style: TextStyle(fontSize: 12, color: Colors.grey),
                            ),
                          )
                        else
                          ...activities.map(
                            (act) => Padding(
                              padding: const EdgeInsets.symmetric(vertical: 6.0),
                              child: Row(
                                children: [
                                  Container(
                                    padding: const EdgeInsets.all(6),
                                    decoration: BoxDecoration(
                                      color: Colors.blue.withOpacity(0.1),
                                      shape: BoxShape.circle,
                                    ),
                                    child: const Icon(Icons.bolt_rounded, size: 14, color: Colors.blue),
                                  ),
                                  const SizedBox(width: 10),
                                  Expanded(
                                    child: Text(
                                      act.title,
                                      style: const TextStyle(fontSize: 12),
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 16),

                // At-Risk Students Section
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'At-Risk Students',
                          style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
                        ),
                        const SizedBox(height: 12),
                        if (atRiskStudents.isEmpty)
                          const Padding(
                            padding: EdgeInsets.symmetric(vertical: 12.0),
                            child: Text(
                              'No students currently flagged at risk.',
                              style: TextStyle(fontSize: 12, color: Colors.grey),
                            ),
                          )
                        else
                          ...atRiskStudents.map((s) => ListTile(
                                dense: true,
                                contentPadding: EdgeInsets.zero,
                                leading: CircleAvatar(
                                  radius: 16,
                                  backgroundColor: Theme.of(context).primaryColor.withOpacity(0.1),
                                  child: Text(s.name.isNotEmpty ? s.name[0] : 'S'),
                                ),
                                title: Text(s.name, style: const TextStyle(fontWeight: FontWeight.w600)),
                                subtitle: Text(s.email, style: const TextStyle(fontSize: 11)),
                                trailing: RiskBadge(level: s.riskLevel, score: s.normalizedScore),
                              )),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 16),

                // Upcoming Tasks Section
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'Upcoming Tasks',
                          style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
                        ),
                        const SizedBox(height: 12),
                        if (pendingTasks.isEmpty)
                          const Padding(
                            padding: EdgeInsets.symmetric(vertical: 12.0),
                            child: Text(
                              'No pending tasks. Great job!',
                              style: TextStyle(fontSize: 12, color: Colors.grey),
                            ),
                          )
                        else
                          ...pendingTasks.map((t) => CheckboxListTile(
                                dense: true,
                                contentPadding: EdgeInsets.zero,
                                value: t.isCompleted,
                                onChanged: (val) async {
                                  if (val != null) {
                                    await ref.read(tasksRepositoryProvider).updateTaskStatus(
                                          t.id,
                                          val ? 'DONE' : 'PENDING',
                                        );
                                    ref.invalidate(dashboardDataProvider);
                                  }
                                },
                                title: Text(t.title, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w500)),
                                subtitle: t.notes != null ? Text(t.notes!, style: const TextStyle(fontSize: 11)) : null,
                              )),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 24),
              ],
            ),
          );
        },
      ),
    );
  }
}
