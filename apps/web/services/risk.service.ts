import { KPICardData, RetentionTrendPoint, RetentionHealthScore } from '../types/dashboard';
import { StudentsService } from './students.service';
import { BillingService } from './billing.service';
import { CampaignsService } from './campaigns.service';
import { apiFetch } from './api-client';

export class RiskService {
  static async getKPICards(): Promise<KPICardData[]> {
    try {
      const [students, billing, campaigns] = await Promise.all([
        StudentsService.getStudents().catch(() => []),
        BillingService.getSubscription().catch(() => null),
        CampaignsService.getCampaigns().catch(() => []),
      ]);

      const totalStudents = students.length || billing?.usage?.students || 0;
      const atRisk = students.filter((s) => (s.riskScore ?? 0) >= 50).length;
      const critical = students.filter((s) => s.riskLevel === 'CRITICAL' || (s.riskScore ?? 0) >= 85).length;
      const recoveredRevenue = campaigns.reduce((acc, c) => acc + (c.recoveredRevenue || 0), 0);

      const retentionRate = totalStudents > 0
        ? Math.round(((totalStudents - atRisk) / totalStudents) * 100)
        : 100;

      return [
        {
          id: 'kpi-1',
          title: 'Students at Risk',
          value: atRisk > 0 ? String(atRisk) : '0',
          change: critical > 0 ? `${critical} critical` : 'Stabilized',
          isPositive: atRisk === 0,
          iconName: 'Users',
          description: 'Requires intervention',
        },
        {
          id: 'kpi-2',
          title: 'Retention Rate',
          value: totalStudents > 0 ? `${retentionRate}%` : '100%',
          change: 'Active cohort retention',
          isPositive: true,
          iconName: 'ShieldCheck',
          description: 'Active cohort retention',
        },
        {
          id: 'kpi-3',
          title: 'Revenue at Risk',
          value: `$${(atRisk * 150).toLocaleString()}`,
          change: critical > 0 ? 'High exposure' : 'Minimal exposure',
          isPositive: atRisk === 0,
          iconName: 'DollarSign',
          description: 'Estimated cohort exposure',
        },
        {
          id: 'kpi-4',
          title: 'Recovered Revenue',
          value: `$${recoveredRevenue.toLocaleString()}`,
          change: 'Saved via AI campaigns',
          isPositive: true,
          iconName: 'TrendingUp',
          description: 'Saved via AI campaigns',
        },
      ];
    } catch {
      return [
        {
          id: 'kpi-1',
          title: 'Students at Risk',
          value: '0',
          change: 'Stabilized',
          isPositive: true,
          iconName: 'Users',
          description: 'Requires intervention',
        },
        {
          id: 'kpi-2',
          title: 'Retention Rate',
          value: '100%',
          change: 'Active cohort retention',
          isPositive: true,
          iconName: 'ShieldCheck',
          description: 'Active cohort retention',
        },
        {
          id: 'kpi-3',
          title: 'Revenue at Risk',
          value: '$0',
          change: 'Minimal exposure',
          isPositive: true,
          iconName: 'DollarSign',
          description: 'Estimated cohort exposure',
        },
        {
          id: 'kpi-4',
          title: 'Recovered Revenue',
          value: '$0',
          change: 'Saved via AI campaigns',
          isPositive: true,
          iconName: 'TrendingUp',
          description: 'Saved via AI campaigns',
        },
      ];
    }
  }

  static async getRetentionTrend(): Promise<RetentionTrendPoint[]> {
    try {
      const trends = await apiFetch<any[]>('analytics/risk-trends');
      if (Array.isArray(trends) && trends.length > 0) {
        const sorted = [...trends].sort((a, b) => new Date(a.period).getTime() - new Date(b.period).getTime());
        return sorted.map((item, idx) => {
          const dist = item.data || {};
          const champion = Number(dist.CHAMPION || 0);
          const low = Number(dist.LOW_RISK || 0);
          const medium = Number(dist.MEDIUM_RISK || 0);
          const high = Number(dist.HIGH_RISK || 0);
          const unscored = Number(dist.UNSCORED || 0);
          const total = champion + low + medium + high + unscored;
          const retained = champion + low;
          const atRisk = high + medium;
          const retentionRate = total > 0 ? Math.round((retained / total) * 100) : 100;
          const engagementRate = total > 0 ? Math.round(((total - high) / total) * 100) : 100;
          const dateStr = item.period ? new Date(item.period).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : `Point ${idx + 1}`;
          return {
            label: dateStr,
            retentionRate,
            engagementRate,
            atRiskCount: atRisk,
          };
        });
      }
      return [];
    } catch {
      return [];
    }
  }

  static async getHealthScore(): Promise<RetentionHealthScore> {
    try {
      const students = await StudentsService.getStudents().catch(() => []);
      const total = students.length;
      const atRisk = students.filter((s) => (s.riskScore ?? 0) >= 50).length;
      const score = total > 0 ? Math.max(0, Math.min(100, Math.round(((total - atRisk) / total) * 100))) : 100;

      return {
        overallScore: score,
        statusText: score >= 80 ? 'Good' : score >= 60 ? 'Warning' : 'Critical',
        breakdown: {
          engagement: score,
          completion: score,
          activity: score,
          retention: score,
        },
        distribution: {
          lowRisk: total > 0 ? Math.round(((total - atRisk) / total) * 100) : 100,
          mediumRisk: total > 0 ? Math.round((students.filter(s => (s.riskScore ?? 0) >= 50 && (s.riskScore ?? 0) < 70).length / total) * 100) : 0,
          highRisk: total > 0 ? Math.round((students.filter(s => (s.riskScore ?? 0) >= 70 && (s.riskScore ?? 0) < 85).length / total) * 100) : 0,
          critical: total > 0 ? Math.round((students.filter(s => (s.riskScore ?? 0) >= 85).length / total) * 100) : 0,
        },
      };
    } catch {
      return {
        overallScore: 0,
        statusText: 'No Data',
        breakdown: {
          engagement: 0,
          completion: 0,
          activity: 0,
          retention: 0,
        },
        distribution: {
          lowRisk: 0,
          mediumRisk: 0,
          highRisk: 0,
          critical: 0,
        },
      };
    }
  }
}
