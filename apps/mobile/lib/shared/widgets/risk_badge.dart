import 'package:flutter/material.dart';

class RiskBadge extends StatelessWidget {
  final String level; // 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL', 'CHAMPION'
  final int? score;

  const RiskBadge({
    super.key,
    required this.level,
    this.score,
  });

  @override
  Widget build(BuildContext context) {
    Color bg;
    Color fg;
    String label = level.toUpperCase();

    switch (label) {
      case 'CHAMPION':
      case 'LOW':
      case 'LOW_RISK':
        bg = const Color(0xFF10B981).withOpacity(0.15);
        fg = const Color(0xFF059669);
        label = 'Low Risk';
        break;
      case 'MEDIUM':
      case 'MEDIUM_RISK':
        bg = const Color(0xFFF59E0B).withOpacity(0.15);
        fg = const Color(0xFFD97706);
        label = 'Medium';
        break;
      case 'HIGH':
      case 'HIGH_RISK':
        bg = const Color(0xFFEF4444).withOpacity(0.15);
        fg = const Color(0xFFDC2626);
        label = 'High Risk';
        break;
      case 'CRITICAL':
        bg = const Color(0xFFBE123C).withOpacity(0.2);
        fg = const Color(0xFFE11D48);
        label = 'Critical';
        break;
      default:
        bg = Colors.grey.withOpacity(0.15);
        fg = Colors.grey;
        label = 'Unscored';
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: fg.withOpacity(0.3), width: 1),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 6,
            height: 6,
            decoration: BoxDecoration(
              color: fg,
              shape: BoxShape.circle,
            ),
          ),
          const SizedBox(width: 5),
          Text(
            score != null ? '$label ($score)' : label,
            style: TextStyle(
              color: fg,
              fontSize: 11,
              fontWeight: FontWeight.bold,
            ),
          ),
        ],
      ),
    );
  }
}
