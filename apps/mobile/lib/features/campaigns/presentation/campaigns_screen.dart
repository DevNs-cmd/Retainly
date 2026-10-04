import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../app/theme/colors.dart';
import '../../../shared/widgets/status_badge.dart';
import '../../../shared/widgets/state_views.dart';
import '../models_and_repo.dart';

final campaignsListProvider = FutureProvider.autoDispose<List<CampaignModel>>((ref) async {
  final repo = ref.watch(campaignsRepositoryProvider);
  return repo.getCampaigns();
});

class CampaignsScreen extends ConsumerWidget {
  const CampaignsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final campaignsAsync = ref.watch(campaignsListProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Re-engagement Campaigns'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () => ref.invalidate(campaignsListProvider),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => _showCreateCampaignDialog(context, ref),
        child: const Icon(Icons.campaign),
      ),
      body: RefreshIndicator(
        onRefresh: () async {
          ref.invalidate(campaignsListProvider);
          await ref.read(campaignsListProvider.future);
        },
        child: campaignsAsync.when(
          loading: () => const LoadingView(message: 'Loading campaigns...'),
          error: (err, stack) => ErrorView(
            message: 'Failed to load campaigns: $err',
            onRetry: () => ref.invalidate(campaignsListProvider),
          ),
          data: (campaigns) {
            if (campaigns.isEmpty) {
              return EmptyStateView(
                icon: Icons.mark_email_unread_outlined,
                title: 'No Campaigns Found',
                message: 'No student retention campaigns active or drafted.',
                actionLabel: 'Launch Campaign',
                onAction: () => _showCreateCampaignDialog(context, ref),
              );
            }

            return ListView.separated(
              padding: const EdgeInsets.all(16),
              itemCount: campaigns.length,
              separatorBuilder: (_, index) => const SizedBox(height: 12),
              itemBuilder: (context, index) {
                final c = campaigns[index];
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
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Expanded(
                              child: Text(
                                c.name,
                                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                              ),
                            ),
                            StatusBadge(status: c.status),
                          ],
                        ),
                        const SizedBox(height: 6),
                        Row(
                          children: [
                            Chip(
                              label: Text(c.type, style: const TextStyle(fontSize: 11)),
                              backgroundColor: AppColors.slate100,
                              padding: EdgeInsets.zero,
                            ),
                            if (c.segment != null) ...[
                              const SizedBox(width: 6),
                              Chip(
                                label: Text(c.segment!, style: const TextStyle(fontSize: 11)),
                                backgroundColor: AppColors.indigo50,
                                labelStyle: const TextStyle(color: AppColors.indigo600),
                                padding: EdgeInsets.zero,
                              ),
                            ],
                          ],
                        ),
                        if (c.message != null && c.message!.isNotEmpty) ...[
                          const SizedBox(height: 8),
                          Text(
                            c.message!,
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                            style: const TextStyle(fontSize: 13, color: AppColors.slate600),
                          ),
                        ],
                        const Divider(height: 20),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceAround,
                          children: [
                            _metricCol('Sent', '${c.sentCount}'),
                            _metricCol('Opened', '${c.openedCount}'),
                            _metricCol('Converted', '${c.convertedCount}'),
                            if (c.recoveredRevenue != null)
                              _metricCol('Recovered', '\$${c.recoveredRevenue!.toStringAsFixed(0)}'),
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

  Widget _metricCol(String label, String value) {
    return Column(
      children: [
        Text(value, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
        const SizedBox(height: 2),
        Text(label, style: const TextStyle(fontSize: 11, color: AppColors.slate400)),
      ],
    );
  }

  void _showCreateCampaignDialog(BuildContext context, WidgetRef ref) {
    final nameController = TextEditingController();
    final messageController = TextEditingController();
    String selectedType = 'EMAIL';
    String selectedSegment = 'HIGH_RISK';
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
                  const Text('Create Engagement Campaign', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 16),
                  TextFormField(
                    controller: nameController,
                    decoration: const InputDecoration(labelText: 'Campaign Name *', border: OutlineInputBorder()),
                    validator: (val) => val == null || val.trim().isEmpty ? 'Please enter a name' : null,
                  ),
                  const SizedBox(height: 12),
                  DropdownButtonFormField<String>(
                    initialValue: selectedType,
                    decoration: const InputDecoration(labelText: 'Channel Type', border: OutlineInputBorder()),
                    items: const [
                      DropdownMenuItem(value: 'EMAIL', child: Text('Email Outreach')),
                      DropdownMenuItem(value: 'SMS', child: Text('SMS Text')),
                    ],
                    onChanged: (val) {
                      if (val != null) setModalState(() => selectedType = val);
                    },
                  ),
                  const SizedBox(height: 12),
                  DropdownButtonFormField<String>(
                    initialValue: selectedSegment,
                    decoration: const InputDecoration(labelText: 'Target Audience Segment', border: OutlineInputBorder()),
                    items: const [
                      DropdownMenuItem(value: 'HIGH_RISK', child: Text('High Risk (Urgent)')),
                      DropdownMenuItem(value: 'MEDIUM_RISK', child: Text('Medium Risk')),
                      DropdownMenuItem(value: 'LOW_RISK', child: Text('Low Risk')),
                    ],
                    onChanged: (val) {
                      if (val != null) setModalState(() => selectedSegment = val);
                    },
                  ),
                  const SizedBox(height: 12),
                  TextFormField(
                    controller: messageController,
                    decoration: const InputDecoration(labelText: 'Campaign Message', border: OutlineInputBorder()),
                    maxLines: 3,
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
                              await ref.read(campaignsRepositoryProvider).createCampaign(
                                    name: nameController.text.trim(),
                                    type: selectedType,
                                    segment: selectedSegment,
                                    message: messageController.text.trim().isEmpty ? null : messageController.text.trim(),
                                  );
                              if (context.mounted) {
                                Navigator.pop(ctx);
                                ref.invalidate(campaignsListProvider);
                                ScaffoldMessenger.of(context).showSnackBar(
                                  const SnackBar(content: Text('Campaign created successfully!')),
                                );
                              }
                            } catch (e) {
                              setModalState(() => isSubmitting = false);
                              if (context.mounted) {
                                ScaffoldMessenger.of(context).showSnackBar(
                                  SnackBar(content: Text('Failed to create campaign: $e'), backgroundColor: AppColors.rose600),
                                );
                              }
                            }
                          },
                    child: isSubmitting
                        ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                        : const Text('Launch Campaign', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
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
