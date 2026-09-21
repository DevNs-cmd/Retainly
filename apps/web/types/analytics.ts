export type AnalyticsTimeRange = '7D' | '30D' | '90D' | '12M';

export interface RetentionDataPoint {
  label: string;
  date: string;
  retentionRate: number; // percentage (e.g. 88.5)
  churnRate: number; // percentage (e.g. 3.2)
  activeStudents: number;
  atRiskStudents: number;
  interventions: number;
}

export interface RevenueDataPoint {
  label: string;
  recoveredRevenue: number;
  atRiskRevenue: number;
}

export interface CohortDataPoint {
  cohort: string;
  initialSize: number;
  week0: number; // 100%
  week2: number;
  week4: number;
  week6: number;
  week8: number;
}

export interface AnalyticsKPISummary {
  retentionRate: number;
  retentionRateDelta: number;
  churnRate: number;
  churnRateDelta: number;
  recoveredRevenue: number;
  recoveredRevenueDelta: number;
  campaignRoi: number;
  campaignRoiDelta: number;
  totalStudents: number;
  savedStudents: number;
}

export interface AnalyticsSourceData {
  range: AnalyticsTimeRange;
  summary: AnalyticsKPISummary;
  retentionTrend: RetentionDataPoint[];
  revenueTrend: RevenueDataPoint[];
  cohortRetention: CohortDataPoint[];
}
