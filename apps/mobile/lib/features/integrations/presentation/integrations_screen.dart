import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import '../../../app/theme/colors.dart';
import '../../../shared/widgets/status_badge.dart';
import '../../../shared/widgets/state_views.dart';
import '../models_and_repo.dart';

final integrationsListProvider = FutureProvider.autoDispose<List<IntegrationModel>>((ref) async {
  final repo = ref.watch(integrationsRepositoryProvider);
  return repo.getIntegrations();
});

class IntegrationsScreen extends ConsumerWidget {
  const IntegrationsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final integrationsAsync = ref.watch(integrationsListProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Integrations & Sync'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () => ref.invalidate(integrationsListProvider),
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () async {
          ref.invalidate(integrationsListProvider);
          await ref.read(integrationsListProvider.future);
        },
        child: integrationsAsync.when(
          loading: () => const LoadingView(message: 'Loading integrations...'),
          error: (err, stack) => ErrorView(
            message: 'Failed to load integrations: $err',
            onRetry: () => ref.invalidate(integrationsListProvider),
          ),
          data: (integrations) {
            // Built-in list of supported providers if empty or merge with returned
            final providers = integrations.isNotEmpty
                ? integrations
                : [
                    IntegrationModel(id: 'int_canvas', organizationId: '', provider: 'Canvas LMS', status: 'DISCONNECTED'),
                    IntegrationModel(id: 'int_stripe', organizationId: '', provider: 'Stripe Billing', status: 'CONNECTED'),
                    IntegrationModel(id: 'int_teachable', organizationId: '', provider: 'Teachable', status: 'DISCONNECTED'),
                  ];

            return ListView.separated(
              padding: const EdgeInsets.all(16),
              itemCount: providers.length,
              separatorBuilder: (_, index) => const SizedBox(height: 12),
              itemBuilder: (context, index) {
                final item = providers[index];
                return Card(
                  elevation: 0,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                    side: BorderSide(color: theme.dividerColor.withOpacity(0.2)),
                  ),
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Row(
                              children: [
                                CircleAvatar(
                                  backgroundColor: AppColors.indigo50,
                                  child: Icon(_getIconForProvider(item.provider), color: AppColors.indigo600),
                                ),
                                const SizedBox(width: 12),
                                Text(
                                  item.provider.toUpperCase(),
                                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
                                ),
                              ],
                            ),
                            StatusBadge(status: item.status),
                          ],
                        ),
                        const SizedBox(height: 12),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              item.lastSyncedAt != null
                                  ? 'Last sync: ${DateFormat.yMMMd().add_jm().format(item.lastSyncedAt!)}'
                                  : 'No historical telemetry sync',
                              style: const TextStyle(fontSize: 12, color: AppColors.slate500),
                            ),
                            OutlinedButton.icon(
                              icon: const Icon(Icons.sync, size: 16),
                              label: const Text('Sync'),
                              style: OutlinedButton.styleFrom(
                                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                                minimumSize: Size.zero,
                              ),
                              onPressed: () async {
                                try {
                                  await ref.read(integrationsRepositoryProvider).syncProvider(item.provider.toLowerCase());
                                  if (context.mounted) {
                                    ScaffoldMessenger.of(context).showSnackBar(
                                      SnackBar(content: Text('Triggered sync for ${item.provider}')),
                                    );
                                  }
                                } catch (e) {
                                  if (context.mounted) {
                                    ScaffoldMessenger.of(context).showSnackBar(
                                      SnackBar(content: Text('Sync error: $e'), backgroundColor: AppColors.rose600),
                                    );
                                  }
                                }
                              },
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                );
              },
            );
          },
        ),
      ),
    );
  }

  IconData _getIconForProvider(String provider) {
    final lower = provider.toLowerCase();
    if (lower.contains('stripe')) return Icons.credit_card;
    if (lower.contains('canvas')) return Icons.school;
    if (lower.contains('teachable')) return Icons.auto_stories;
    return Icons.cloud_sync;
  }
}
