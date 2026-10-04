import 'package:flutter/material.dart';
import '../../../app/theme/colors.dart';
import '../../campaigns/presentation/campaigns_screen.dart';
import '../../courses/presentation/courses_screen.dart';
import '../../billing/presentation/billing_screen.dart';
import '../../integrations/presentation/integrations_screen.dart';
import '../../settings/presentation/settings_screen.dart';

class MoreScreen extends StatelessWidget {
  const MoreScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    final items = [
      _MoreItem(
        title: 'Courses & Curricula',
        subtitle: 'Manage courses, modules, and learning tracks',
        icon: Icons.school_outlined,
        color: AppColors.indigo600,
        builder: (_) => const CoursesScreen(),
      ),
      _MoreItem(
        title: 'Re-engagement Campaigns',
        subtitle: 'Automated email and SMS retention workflows',
        icon: Icons.campaign_outlined,
        color: AppColors.emerald600,
        builder: (_) => const CampaignsScreen(),
      ),
      _MoreItem(
        title: 'Billing & Subscriptions',
        subtitle: 'Plan quotas, Stripe customer portal & usage',
        icon: Icons.credit_card_outlined,
        color: AppColors.amber500,
        builder: (_) => const BillingScreen(),
      ),
      _MoreItem(
        title: 'Integrations & Sync',
        subtitle: 'Canvas LMS, Teachable, Stripe & webhooks',
        icon: Icons.sync_alt_outlined,
        color: AppColors.indigo500,
        builder: (_) => const IntegrationsScreen(),
      ),
      _MoreItem(
        title: 'Settings & Appearance',
        subtitle: 'Workspace session, theme & preferences',
        icon: Icons.settings_outlined,
        color: AppColors.slate600,
        builder: (_) => const SettingsScreen(),
      ),
    ];

    return Scaffold(
      appBar: AppBar(
        title: const Text('Workspace Hub'),
      ),
      body: ListView.separated(
        padding: const EdgeInsets.all(16),
        itemCount: items.length,
        separatorBuilder: (_, index) => const SizedBox(height: 12),
        itemBuilder: (context, index) {
          final item = items[index];
          return Card(
            elevation: 0,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
              side: BorderSide(color: theme.dividerColor.withOpacity(0.2)),
            ),
            child: ListTile(
              contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              leading: CircleAvatar(
                backgroundColor: item.color.withOpacity(0.12),
                child: Icon(item.icon, color: item.color),
              ),
              title: Text(item.title, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 15)),
              subtitle: Text(item.subtitle, style: const TextStyle(fontSize: 12, color: AppColors.slate500)),
              trailing: const Icon(Icons.chevron_right, color: AppColors.slate400),
              onTap: () {
                Navigator.push(context, MaterialPageRoute(builder: item.builder));
              },
            ),
          );
        },
      ),
    );
  }
}

class _MoreItem {
  final String title;
  final String subtitle;
  final IconData icon;
  final Color color;
  final WidgetBuilder builder;

  _MoreItem({
    required this.title,
    required this.subtitle,
    required this.icon,
    required this.color,
    required this.builder,
  });
}
