import 'package:flutter/material.dart';

class StatusBadge extends StatelessWidget {
  final String status;

  const StatusBadge({super.key, required this.status});

  @override
  Widget build(BuildContext context) {
    Color bg;
    Color fg;
    final normalized = status.toUpperCase();

    if (normalized.contains('ACTIVE') || normalized.contains('DONE') || normalized.contains('COMPLETED') || normalized.contains('CONNECTED')) {
      bg = const Color(0xFF10B981).withOpacity(0.12);
      fg = const Color(0xFF059669);
    } else if (normalized.contains('PENDING') || normalized.contains('IN_PROGRESS') || normalized.contains('RUNNING')) {
      bg = const Color(0xFF38BDF8).withOpacity(0.12);
      fg = const Color(0xFF0284C7);
    } else if (normalized.contains('PAUSED') || normalized.contains('SNOOZED') || normalized.contains('DRAFT')) {
      bg = const Color(0xFFF59E0B).withOpacity(0.12);
      fg = const Color(0xFFD97706);
    } else if (normalized.contains('CANCELLED') || normalized.contains('DISCONNECTED') || normalized.contains('EXPIRED')) {
      bg = const Color(0xFFEF4444).withOpacity(0.12);
      fg = const Color(0xFFDC2626);
    } else {
      bg = Colors.grey.withOpacity(0.12);
      fg = Colors.grey;
    }

    final formatted = status.replaceAll('_', ' ');
    final display = formatted.isEmpty ? '' : formatted[0].toUpperCase() + formatted.substring(1).toLowerCase();

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(6),
        border: Border.all(color: fg.withOpacity(0.25), width: 1),
      ),
      child: Text(
        display,
        style: TextStyle(
          color: fg,
          fontSize: 11,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }
}
