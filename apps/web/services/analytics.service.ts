import { AnalyticsSourceData, AnalyticsTimeRange, RetentionDataPoint, RevenueDataPoint, CohortDataPoint } from '../types/analytics';
import { apiFetch } from './api-client';
import { StudentsService } from './students.service';
import { CampaignsService } from './campaigns.service';

export class AnalyticsService {
  static async getAnalytics(range: AnalyticsTimeRange = '30D'): Promise<AnalyticsSourceData> {
    try {
      const [overviewRes, cohortsRes, riskTrendsRes, students, campaigns] = await Promise.all([
        apiFetch<any[]>('analytics/overview').catch(() => []),
        apiFetch<any[]>('analytics/cohorts').catch(() => []),
        apiFetch<any[]>('analytics/risk-trends').catch(() => []),
        StudentsService.getStudents().catch(() => []),
        CampaignsService.getCampaigns().catch(() => []),
      ]);

      const overviewItem = Array.isArray(overviewRes) && overviewRes.length > 0 ? overviewRes[0] : (overviewRes && !Array.isArray(overviewRes) ? overviewRes : null);
      const overviewData = overviewItem?.data || {};

      const totalStudents = students.length;
      const atRiskStudents = students.filter((s) => (s.riskScore ?? 0) >= 50).length;
      const savedStudents = typeof overviewData.studentsSaved === 'number' ? overviewData.studentsSaved : 0;
      const liveChurnRate = typeof overviewData.churnRate === 'number' ? overviewData.churnRate : 0;

      const retentionRate = totalStudents > 0
        ? Math.round(((totalStudents - atRiskStudents) / totalStudents) * 100)
        : (liveChurnRate > 0 ? Math.max(0, 100 - liveChurnRate) : 100);

      const recoveredRevenue = campaigns.reduce((acc, c) => acc + (c.recoveredRevenue || 0), 0) || (savedStudents * 150);

      // Build retentionTrend from live risk-trends
      const rawTrends = Array.isArray(riskTrendsRes) ? riskTrendsRes : [];
      const riskTrends = [...rawTrends].sort((a, b) => new Date(a.period).getTime() - new Date(b.period).getTime());
      const retentionTrend: RetentionDataPoint[] = riskTrends.map((rt: any, idx: number) => {
        const dist = rt.data || {};
        const champion = Number(dist.CHAMPION || 0);
        const low = Number(dist.LOW_RISK || 0);
        const medium = Number(dist.MEDIUM_RISK || 0);
        const high = Number(dist.HIGH_RISK || 0);
        const unscored = Number(dist.UNSCORED || 0);
        const total = champion + low + medium + high + unscored;
        const retained = champion + low;
        const atRisk = high + medium;
        const retRate = total > 0 ? Math.round((retained / total) * 100) : 100;
        const cRate = total > 0 ? Math.round((atRisk / total) * 100) : 0;
        const dateObj = rt.period ? new Date(rt.period) : new Date();
        const dateLabel = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const dateStr = dateObj.toISOString().split('T')[0];

        return {
          label: dateLabel || `Point ${idx + 1}`,
          date: dateStr,
          retentionRate: retRate,
          churnRate: cRate,
          activeStudents: champion + low + unscored,
          atRiskStudents: atRisk,
          interventions: 0,
        };
      });

      // Build revenueTrend from retentionTrend
      const revenueTrend: RevenueDataPoint[] = retentionTrend.map((pt) => ({
        label: pt.label,
        recoveredRevenue: recoveredRevenue,
        atRiskRevenue: pt.atRiskStudents * 150,
      }));

      // Build cohortRetention from live cohorts
      const rawCohorts = Array.isArray(cohortsRes) ? cohortsRes : (cohortsRes && !Array.isArray(cohortsRes) ? [cohortsRes] : []);
      const cohorts = [...rawCohorts].sort((a, b) => (a.key || a.data?.cohortMonth || '').localeCompare(b.key || b.data?.cohortMonth || ''));
      const cohortRetention: CohortDataPoint[] = cohorts.map((c: any) => {
        const cohortMonth = c.data?.cohortMonth || c.key || 'Current';
        const enrolled = c.data?.enrolledCount || 0;
        const retentionArr = Array.isArray(c.data?.retention) ? c.data.retention : [];
        const getRate = (p: number) => {
          const entry = retentionArr.find((r: any) => r.period === p || r.period === String(p) || r.period === `W${p}` || r.period === `Week ${p}`);
          if (!entry) return 100;
          const rateVal = typeof entry.rate === 'number' ? entry.rate : 1;
          return Math.round(rateVal <= 1 ? rateVal * 100 : rateVal);
        };
        return {
          cohort: cohortMonth,
          initialSize: enrolled,
          week0: 100,
          week2: getRate(2),
          week4: getRate(4),
          week6: getRate(6),
          week8: getRate(8),
        };
      });

      return {
        range,
        summary: {
          retentionRate,
          retentionRateDelta: 0,
          churnRate: liveChurnRate,
          churnRateDelta: 0,
          recoveredRevenue,
          recoveredRevenueDelta: 0,
          campaignRoi: recoveredRevenue > 0 ? Number((recoveredRevenue / 499).toFixed(1)) : 0,
          campaignRoiDelta: 0,
          totalStudents,
          savedStudents,
        },
        retentionTrend,
        revenueTrend,
        cohortRetention,
      };
    } catch (err) {
      console.error('Failed to load analytics from backend:', err);
      return {
        range,
        summary: {
          retentionRate: 100,
          retentionRateDelta: 0,
          churnRate: 0,
          churnRateDelta: 0,
          recoveredRevenue: 0,
          recoveredRevenueDelta: 0,
          campaignRoi: 0,
          campaignRoiDelta: 0,
          totalStudents: 0,
          savedStudents: 0,
        },
        retentionTrend: [],
        revenueTrend: [],
        cohortRetention: [],
      };
    }
  }

  static downloadCSV(data: AnalyticsSourceData) {
    const headers = ['Period/Label', 'Date', 'Retention Rate (%)', 'Churn Rate (%)', 'Active Students', 'At-Risk Students', 'Interventions', 'Recovered Revenue ($)', 'At-Risk Revenue ($)'];
    const rows = data.retentionTrend.map((pt, idx) => {
      const rev = data.revenueTrend[idx] || { recoveredRevenue: 0, atRiskRevenue: 0 };
      return [
        pt.label,
        pt.date,
        pt.retentionRate,
        pt.churnRate,
        pt.activeStudents,
        pt.atRiskStudents,
        pt.interventions,
        rev.recoveredRevenue,
        rev.atRiskRevenue,
      ];
    });

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `retainly_analytics_${data.range.toLowerCase()}_report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
