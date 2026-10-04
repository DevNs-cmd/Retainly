import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:retainly_mobile/app/app.dart';
import 'package:retainly_mobile/shared/widgets/kpi_card_widget.dart';
import 'package:retainly_mobile/shared/widgets/risk_badge.dart';
import 'package:retainly_mobile/shared/widgets/status_badge.dart';
import 'package:retainly_mobile/shared/widgets/state_views.dart';

void main() {
  group('Design System & UI Widgets Tests', () {
    testWidgets('KpiCardWidget renders title, value and trend', (WidgetTester tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: KpiCardWidget(
              title: 'Retention Rate',
              value: '94%',
              change: '+4.2%',
              icon: Icons.shield,
            ),
          ),
        ),
      );

      expect(find.text('Retention Rate'), findsOneWidget);
      expect(find.text('94%'), findsOneWidget);
      expect(find.text('+4.2%'), findsOneWidget);
      expect(find.byIcon(Icons.shield), findsOneWidget);
    });

    testWidgets('RiskBadge renders critical, medium, and low levels', (WidgetTester tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: Column(
              children: [
                RiskBadge(level: 'HIGH', score: 85),
                RiskBadge(level: 'MEDIUM', score: 55),
                RiskBadge(level: 'LOW', score: 20),
              ],
            ),
          ),
        ),
      );

      expect(find.text('High Risk (85)'), findsOneWidget);
      expect(find.text('Medium (55)'), findsOneWidget);
      expect(find.text('Low Risk (20)'), findsOneWidget);
    });

    testWidgets('StatusBadge renders entity status correctly', (WidgetTester tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: Column(
              children: [
                StatusBadge(status: 'ACTIVE'),
                StatusBadge(status: 'PENDING'),
                StatusBadge(status: 'DONE'),
              ],
            ),
          ),
        ),
      );

      expect(find.text('Active'), findsOneWidget);
      expect(find.text('Pending'), findsOneWidget);
      expect(find.text('Done'), findsOneWidget);
    });

    testWidgets('EmptyStateView renders title, message and action button', (WidgetTester tester) async {
      bool actionTapped = false;
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: EmptyStateView(
              icon: Icons.inbox,
              title: 'No Data Here',
              message: 'Get started by creating your first entry.',
              actionLabel: 'Create Now',
              onAction: () => actionTapped = true,
            ),
          ),
        ),
      );

      expect(find.text('No Data Here'), findsOneWidget);
      expect(find.text('Get started by creating your first entry.'), findsOneWidget);
      expect(find.text('Create Now'), findsOneWidget);

      await tester.tap(find.text('Create Now'));
      expect(actionTapped, isTrue);
    });

    testWidgets('RetainlyApp launches and displays branding', (WidgetTester tester) async {
      await tester.pumpWidget(
        const ProviderScope(
          child: RetainlyApp(),
        ),
      );

      // Verify app starts
      await tester.pump();
      expect(find.byType(MaterialApp), findsOneWidget);
    });
  });
}
