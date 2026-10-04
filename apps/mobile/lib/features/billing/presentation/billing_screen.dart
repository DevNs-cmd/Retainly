import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../app/theme/colors.dart';
import '../../../shared/widgets/state_views.dart';
import '../models_and_repo.dart';

final billingSubscriptionProvider = FutureProvider.autoDispose<SubscriptionModel>((ref) async {
  final repo = ref.watch(billingRepositoryProvider);
  return repo.getSubscription();
});

class BillingScreen extends ConsumerWidget {
  const BillingScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final subAsync = ref.watch(billingSubscriptionProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Billing & Subscription'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () => ref.invalidate(billingSubscriptionProvider),
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () async {
          ref.invalidate(billingSubscriptionProvider);
          await ref.read(billingSubscriptionProvider.future);
        },
        child: subAsync.when(
          loading: () => const LoadingView(message: 'Loading subscription...'),
          error: (err, stack) => ErrorView(
            message: 'Failed to load subscription: $err',
            onRetry: () => ref.invalidate(billingSubscriptionProvider),
          ),
          data: (sub) {
            return ListView(
              padding: const EdgeInsets.all(16),
              children: [
                // Current Plan Card
                Card(
                  elevation: 0,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16),
                    side: const BorderSide(color: AppColors.indigo500, width: 1.5),
                  ),
                  color: AppColors.indigo50.withOpacity(0.3),
                  child: Padding(
                    padding: const EdgeInsets.all(20.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              '${sub.planTier} PLAN',
                              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: AppColors.indigo600),
                            ),
                            Chip(
                              label: Text(sub.status, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                              backgroundColor: sub.status == 'ACTIVE' ? AppColors.emerald50 : AppColors.amber50,
                              labelStyle: TextStyle(color: sub.status == 'ACTIVE' ? AppColors.emerald700 : AppColors.amber700),
                            ),
                          ],
                        ),
                        const SizedBox(height: 8),
                        const Text(
                          'Full access to AI retention scoring, automated workflows, and multi-channel re-engagement.',
                          style: TextStyle(fontSize: 13, color: AppColors.slate600),
                        ),
                        const SizedBox(height: 16),
                        ElevatedButton.icon(
                          style: ElevatedButton.styleFrom(backgroundColor: AppColors.indigo600, foregroundColor: Colors.white),
                          onPressed: () => _openCustomerPortal(context, ref),
                          icon: const Icon(Icons.open_in_new, size: 16),
                          label: const Text('Manage in Stripe Portal'),
                        ),
                      ],
                    ),
                  ),
                ),

                const SizedBox(height: 20),

                // Resource Usage Quotas
                Text('Workspace Usage & Limits', style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold)),
                const SizedBox(height: 12),
                _usageCard(
                  label: 'Enrolled Students',
                  used: sub.studentsUsed,
                  limit: sub.studentsLimit,
                  icon: Icons.people,
                ),
                const SizedBox(height: 10),
                _usageCard(
                  label: 'Published Courses',
                  used: sub.coursesUsed,
                  limit: sub.coursesLimit,
                  icon: Icons.menu_book,
                ),
                const SizedBox(height: 10),
                _usageCard(
                  label: 'Monthly Outreach Emails',
                  used: sub.emailsUsed,
                  limit: sub.emailsLimit,
                  icon: Icons.mail_outline,
                ),

                const SizedBox(height: 24),

                // Upgrade Options
                Text('Upgrade Plans', style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold)),
                const SizedBox(height: 12),
                _planOption(
                  context: context,
                  ref: ref,
                  name: 'PRO PLAN',
                  price: '\$49/mo',
                  tier: 'PRO',
                  desc: 'Up to 5,000 students, high-frequency AI evaluations, and priority outreach.',
                ),
                const SizedBox(height: 12),
                _planOption(
                  context: context,
                  ref: ref,
                  name: 'ENTERPRISE PLAN',
                  price: '\$199/mo',
                  tier: 'ENTERPRISE',
                  desc: 'Unlimited students, dedicated custom AI fine-tuning, and SLA-backed support.',
                ),
              ],
            );
          },
        ),
      ),
    );
  }

  Widget _usageCard({required String label, required int used, required int limit, required IconData icon}) {
    final progress = limit > 0 ? (used / limit).clamp(0.0, 1.0) : 0.0;
    return Card(
      elevation: 0,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12), side: const BorderSide(color: AppColors.slate200)),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(icon, size: 20, color: AppColors.indigo600),
                const SizedBox(width: 8),
                Expanded(child: Text(label, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14))),
                Text('$used / $limit', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: AppColors.slate600)),
              ],
            ),
            const SizedBox(height: 10),
            ClipRRect(
              borderRadius: BorderRadius.circular(4),
              child: LinearProgressIndicator(
                value: progress,
                minHeight: 6,
                backgroundColor: AppColors.slate100,
                valueColor: AlwaysStoppedAnimation<Color>(
                  progress > 0.85 ? AppColors.rose600 : AppColors.indigo600,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _planOption({
    required BuildContext context,
    required WidgetRef ref,
    required String name,
    required String price,
    required String tier,
    required String desc,
  }) {
    return Card(
      elevation: 0,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12), side: const BorderSide(color: AppColors.slate200)),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(name, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                Text(price, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: AppColors.indigo600)),
              ],
            ),
            const SizedBox(height: 6),
            Text(desc, style: const TextStyle(fontSize: 13, color: AppColors.slate600)),
            const SizedBox(height: 12),
            OutlinedButton(
              style: OutlinedButton.styleFrom(
                minimumSize: const Size.fromHeight(40),
                foregroundColor: AppColors.indigo600,
                side: const BorderSide(color: AppColors.indigo600),
              ),
              onPressed: () => _startCheckout(context, ref, tier),
              child: Text('Upgrade to $tier'),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _startCheckout(BuildContext context, WidgetRef ref, String tier) async {
    try {
      final reqId = 'req_${DateTime.now().millisecondsSinceEpoch}';
      final checkoutUrl = await ref.read(billingRepositoryProvider).createCheckout(tier, reqId);
      if (checkoutUrl != null) {
        final uri = Uri.parse(checkoutUrl);
        if (await canLaunchUrl(uri)) {
          await launchUrl(uri, mode: LaunchMode.externalApplication);
        } else {
          if (context.mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(content: Text('Cannot open URL: $checkoutUrl')),
            );
          }
        }
      }
    } catch (e) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to initiate checkout: $e'), backgroundColor: AppColors.rose600),
        );
      }
    }
  }

  Future<void> _openCustomerPortal(BuildContext context, WidgetRef ref) async {
    try {
      final portalUrl = await ref.read(billingRepositoryProvider).createPortal();
      if (portalUrl != null) {
        final uri = Uri.parse(portalUrl);
        if (await canLaunchUrl(uri)) {
          await launchUrl(uri, mode: LaunchMode.externalApplication);
        } else {
          if (context.mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(content: Text('Cannot open URL: $portalUrl')),
            );
          }
        }
      }
    } catch (e) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to open billing portal: $e'), backgroundColor: AppColors.rose600),
        );
      }
    }
  }
}
