import { KPICardData, RetentionTrendPoint, RetentionHealthScore } from '../types/dashboard';

export const MOCK_KPI_CARDS: KPICardData[] = [
  {
    id: 'kpi-1',
    title: 'Students at Risk',
    value: '342',
    change: '+8.4% vs last month',
    isPositive: false,
    iconName: 'Users',
    description: 'Requires intervention'
  },
  {
    id: 'kpi-2',
    title: 'Retention Rate',
    value: '87.4%',
    change: '+3.2% vs last month',
    isPositive: true,
    iconName: 'ShieldCheck',
    description: 'Active cohort retention'
  },
  {
    id: 'kpi-3',
    title: 'Revenue at Risk',
    value: '$24,680',
    change: '-6.8% vs last month',
    isPositive: true, // Lower revenue loss is positive
    iconName: 'DollarSign',
    description: 'Estimated ARR loss'
  },
  {
    id: 'kpi-4',
    title: 'Recovered Revenue',
    value: '$18,420',
    change: '+12.6% vs last month',
    isPositive: true,
    iconName: 'TrendingUp',
    description: 'Saved via AI campaigns'
  }
];

export const MOCK_RETENTION_TREND: RetentionTrendPoint[] = [
  { label: 'Week 1', retentionRate: 82, engagementRate: 71, atRiskCount: 410 },
  { label: 'Week 2', retentionRate: 84, engagementRate: 73, atRiskCount: 390 },
  { label: 'Week 3', retentionRate: 83, engagementRate: 70, atRiskCount: 395 },
  { label: 'Week 4', retentionRate: 87, engagementRate: 74, atRiskCount: 360 },
  { label: 'Week 5', retentionRate: 89, engagementRate: 78, atRiskCount: 330 },
  { label: 'Week 6', retentionRate: 87.4, engagementRate: 74.8, atRiskCount: 342 }
];

export const MOCK_HEALTH_SCORE: RetentionHealthScore = {
  overallScore: 84,
  statusText: 'Good',
  breakdown: {
    engagement: 82,
    completion: 76,
    activity: 88,
    retention: 91
  },
  distribution: {
    lowRisk: 62,
    mediumRisk: 24,
    highRisk: 10,
    critical: 4
  }
};
