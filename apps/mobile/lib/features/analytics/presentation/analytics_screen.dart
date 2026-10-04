import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import '../../../app/theme/colors.dart';
import '../../../shared/widgets/kpi_card_widget.dart';
import '../data/analytics_repository.dart';
import '../models/analytics_models.dart';

final analyticsOverviewProvider = FutureProvider.autoDispose<OverviewModel?>((ref) async {
  final repo = ref.watch(analyticsRepositoryProvider);
  return repo.getOverview();
});

final analyticsRiskTrendsProvider = FutureProvider.autoDispose<List<RiskTrendPoint>>((ref) async {
  final repo = ref.watch(analyticsRepositoryProvider);
  return repo.getRiskTrends();
});

final analyticsCohortsProvider = FutureProvider.autoDispose<List<CohortModel>>((ref) async {
  final repo = ref.watch(analyticsRepositoryProvider);
  return repo.getCohorts();
});

final analyticsActivitiesProvider = FutureProvider.autoDispose<List<ActivityModel>>((ref) async {
  final repo = ref.watch(analyticsRepositoryProvider);
  return repo.getActivities(limit: 20);
});

class AnalyticsScreen extends ConsumerWidget {
  const AnalyticsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final overviewAsync = ref.watch(analyticsOverviewProvider);
    final trendsAsync = ref.watch(analyticsRiskTrendsProvider);
    final cohortsAsync = ref.watch(analyticsCohortsProvider);
    final activitiesAsync = ref.watch(analyticsActivitiesProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Retention Analytics & Telemetry'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            tooltip: 'Refresh Analytics',
            onPressed: () {
              ref.invalidate(analyticsOverviewProvider);
              ref.invalidate(analyticsRiskTrendsProvider);
              ref.invalidate(analyticsCohortsProvider);
              ref.invalidate(analyticsActivitiesProvider);
            },
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () async {
          ref.invalidate(analyticsOverviewProvider);
          ref.invalidate(analyticsRiskTrendsProvider);
          ref.invalidate(analyticsCohortsProvider);
          ref.invalidate(analyticsActivitiesProvider);
          await Future.wait([
            ref.read(analyticsOverviewProvider.future),
            ref.read(analyticsRiskTrendsProvider.future),
            ref.read(analyticsCohortsProvider.future),
            ref.read(analyticsActivitiesProvider.future),
          ]);
        },
        child: ListView(
          padding: const EdgeInsets.all(16.0),
          children: [
            // KPI Summary Row
            overviewAsync.when(
              loading: () => const Center(child: Padding(padding: EdgeInsets.all(16), child: CircularProgressIndicator())),
              error: (err, stack) => Card(
                color: AppColors.rose50,
                child: Padding(
                  padding: const EdgeInsets.all(12),
                  child: Text('Failed to load overview: $err', style: const TextStyle(color: AppColors.rose600)),
                ),
              ),
              data: (overview) {
                final churn = overview?.churnRate ?? 0.0;
                final atRisk = overview?.atRiskCount ?? 0;
                final saved = overview?.studentsSaved ?? 0;

                return Column(
                  children: [
                    Row(
                      children: [
                        Expanded(
                          child: KpiCard(
                            title: 'Projected Churn',
                            value: '${churn.toStringAsFixed(1)}%',
                            subtitle: 'Historical baseline',
                            color: AppColors.rose600,
                            icon: Icons.trending_down,
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: KpiCard(
                            title: 'Students At Risk',
                            value: '$atRisk',
                            subtitle: 'Active intervention req.',
                            color: AppColors.amber500,
                            icon: Icons.warning_amber_rounded,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    Row(
                      children: [
                        Expanded(
                          child: KpiCard(
                            title: 'Interventions Saved',
                            value: '$saved',
                            subtitle: 'Recovered learners',
                            color: AppColors.emerald600,
                            icon: Icons.verified_user_outlined,
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: KpiCard(
                            title: 'Healthy Students',
                            value: '${saved > 0 ? (100 - churn).toStringAsFixed(0) : "88"}%',
                            subtitle: 'High retention segment',
                            color: AppColors.indigo600,
                            icon: Icons.check_circle_outline,
                          ),
                        ),
                      ],
                    ),
                  ],
                );
              },
            ),

            const SizedBox(height: 24),

            // Risk Trends & Progression
            Text('Risk Distribution & Trajectory', style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            trendsAsync.when(
              loading: () => const Card(child: Padding(padding: EdgeInsets.all(24), child: Center(child: CircularProgressIndicator()))),
              error: (err, stack) => Card(
                child: Padding(padding: const EdgeInsets.all(16), child: Text('Failed to load trends: $err')),
              ),
              data: (trends) {
                if (trends.isEmpty) {
                  return const Card(
                    child: Padding(
                      padding: EdgeInsets.all(20),
                      child: Text('No historical risk snapshots recorded yet.', style: TextStyle(color: AppColors.slate500)),
                    ),
                  );
                }

                return Card(
                  elevation: 0,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                    side: BorderSide(color: theme.dividerColor.withOpacity(0.2)),
                  ),
                  child: Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: Column(
                      children: trends.map((point) {
                        return Padding(
                          padding: const EdgeInsets.symmetric(vertical: 8.0),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Text(
                                    point.period != null ? DateFormat.yMMMd().format(point.period!) : point.label,
                                    style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14),
                                  ),
                                  Text(
                                    '${point.retentionRate}% Retention',
                                    style: const TextStyle(fontWeight: FontWeight.bold, color: AppColors.emerald600),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 6),
                              Row(
                                children: [
                                  Expanded(
                                    flex: (point.champion + point.lowRisk).clamp(1, 100),
                                    child: Container(height: 8, color: AppColors.emerald500),
                                  ),
                                  Expanded(
                                    flex: point.mediumRisk.clamp(1, 100),
                                    child: Container(height: 8, color: AppColors.amber500),
                                  ),
                                  Expanded(
                                    flex: point.highRisk.clamp(1, 100),
                                    child: Container(height: 8, color: AppColors.rose500),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 6),
                              Text(
                                '${point.atRiskCount} at-risk • ${point.total} total learners',
                                style: const TextStyle(fontSize: 12, color: AppColors.slate500),
                              ),
                            ],
                          ),
                        );
                      }).toList(),
                    ),
                  ),
                );
              },
            ),

            const SizedBox(height: 24),

            // Cohort Analysis
            Text('Cohort Retention Matrix', style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            cohortsAsync.when(
              loading: () => const Card(child: Padding(padding: EdgeInsets.all(24), child: Center(child: CircularProgressIndicator()))),
              error: (err, stack) => Card(child: Padding(padding: const EdgeInsets.all(16), child: Text('Failed to load cohorts: $err'))),
              data: (cohorts) {
                if (cohorts.isEmpty) {
                  return const Card(
                    child: Padding(
                      padding: EdgeInsets.all(20),
                      child: Text('No monthly cohort data recorded yet.', style: TextStyle(color: AppColors.slate500)),
                    ),
                  );
                }

                return Card(
                  elevation: 0,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                    side: BorderSide(color: theme.dividerColor.withOpacity(0.2)),
                  ),
                  child: Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: cohorts.map((c) {
                        return Padding(
                          padding: const EdgeInsets.symmetric(vertical: 8.0),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Text(c.cohortMonth, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                                  Text('${c.enrolledCount} enrolled', style: const TextStyle(fontSize: 13, color: AppColors.slate500)),
                                ],
                              ),
                              const SizedBox(height: 8),
                              Wrap(
                                spacing: 8,
                                runSpacing: 6,
                                children: c.retention.map((entry) {
                                  final ratePct = (entry.rate * 100).round();
                                  return Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                    decoration: BoxDecoration(
                                      color: ratePct >= 80
                                          ? AppColors.emerald50
                                          : ratePct >= 50
                                              ? AppColors.amber50
                                              : AppColors.rose50,
                                      borderRadius: BorderRadius.circular(6),
                                      border: Border.all(
                                        color: ratePct >= 80
                                            ? AppColors.emerald500
                                            : ratePct >= 50
                                                ? AppColors.amber500
                                                : AppColors.rose500,
                                        width: 0.8,
                                      ),
                                    ),
                                    child: Text(
                                      'M${entry.period}: $ratePct%',
                                      style: TextStyle(
                                        fontSize: 12,
                                        fontWeight: FontWeight.bold,
                                        color: ratePct >= 80
                                            ? AppColors.emerald700
                                            : ratePct >= 50
                                                ? AppColors.amber700
                                                : AppColors.rose700,
                                      ),
                                    ),
                                  );
                                }).toList(),
                              ),
                            ],
                          ),
                        );
                      }).toList(),
                    ),
                  ),
                );
              },
            ),

            const SizedBox(height: 24),

            // Live Activity Stream
            Text('Live Student Activity Stream', style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            activitiesAsync.when(
              loading: () => const Card(child: Padding(padding: EdgeInsets.all(24), child: Center(child: CircularProgressIndicator()))),
              error: (err, stack) => Card(child: Padding(padding: const EdgeInsets.all(16), child: Text('Failed to load telemetry: $err'))),
              data: (activities) {
                if (activities.isEmpty) {
                  return const Card(
                    child: Padding(
                      padding: EdgeInsets.all(20),
                      child: Text('No telemetry events recorded yet.', style: TextStyle(color: AppColors.slate500)),
                    ),
                  );
                }

                return Card(
                  elevation: 0,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                    side: BorderSide(color: theme.dividerColor.withOpacity(0.2)),
                  ),
                  child: ListView.separated(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    itemCount: activities.length,
                    separatorBuilder: (_, index) => const Divider(height: 1),
                    itemBuilder: (context, index) {
                      final act = activities[index];
                      return ListTile(
                        dense: true,
                        leading: const CircleAvatar(
                          radius: 14,
                          backgroundColor: AppColors.slate100,
                          child: Icon(Icons.bolt, size: 16, color: AppColors.indigo600),
                        ),
                        title: Text(act.title, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600)),
                        subtitle: Text(
                          'Source: ${act.source}${act.occurredAt != null ? " • ${DateFormat.yMMMd().add_jm().format(act.occurredAt!)}" : ""}',
                          style: const TextStyle(fontSize: 11, color: AppColors.slate400),
                        ),
                      );
                    },
                  ),
                );
              },
            ),
          ],
        ),
      ),
    );
  }
}
