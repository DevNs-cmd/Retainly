import { AnalyticsSourceData, AnalyticsTimeRange } from '../types/analytics';
import { MOCK_ANALYTICS_DATA } from '../mock/analytics';
import { simulateApiCall } from './api-client';

export class AnalyticsService {
  static async getAnalytics(range: AnalyticsTimeRange = '30D'): Promise<AnalyticsSourceData> {
    const data = MOCK_ANALYTICS_DATA[range] || MOCK_ANALYTICS_DATA['30D'];
    return simulateApiCall(data);
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
        rev.atRiskRevenue
      ];
    });

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
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
