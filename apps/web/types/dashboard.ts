export interface KPICardData {
  id: string;
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
  iconName: string;
  description: string;
}

export interface RetentionTrendPoint {
  label: string; // e.g. "Week 1", "Aug 1"
  retentionRate: number; // percentage
  engagementRate: number; // percentage
  atRiskCount: number;
}

export interface RetentionHealthScore {
  overallScore: number; // e.g. 84
  statusText: string; // e.g. "Good"
  breakdown: {
    engagement: number;
    completion: number;
    activity: number;
    retention: number;
  };
  distribution: {
    lowRisk: number; // 62%
    mediumRisk: number; // 24%
    highRisk: number; // 10%
    critical: number; // 4%
  };
}
