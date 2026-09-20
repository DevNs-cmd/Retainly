export const RISK_SCORING_SERVICE = Symbol('RISK_SCORING_SERVICE');
export interface RiskFeatures {
  tenureMonths?: number; monthlyCharges?: number; daysSinceLastLogin?: number;
  studentId: string; organizationId: string; windowDays: number; activityCount: number;
  daysSinceLastActivity: number | null; lessonCompletions: number; failedPayments: number;
  countsByType: Record<string, number>;
}
export interface RiskResult { score: number; reasons: string[]; confidence: number; }
export interface IRiskScoringService { calculate(features: RiskFeatures): Promise<RiskResult>; }
