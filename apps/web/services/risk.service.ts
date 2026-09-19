import { MOCK_KPI_CARDS, MOCK_RETENTION_TREND, MOCK_HEALTH_SCORE } from '../mock/dashboard';
import { KPICardData, RetentionTrendPoint, RetentionHealthScore } from '../types/dashboard';
import { simulateApiCall } from './api-client';

export class RiskService {
  static async getKPICards(): Promise<KPICardData[]> {
    return simulateApiCall(MOCK_KPI_CARDS);
  }

  static async getRetentionTrend(): Promise<RetentionTrendPoint[]> {
    return simulateApiCall(MOCK_RETENTION_TREND);
  }

  static async getHealthScore(): Promise<RetentionHealthScore> {
    return simulateApiCall(MOCK_HEALTH_SCORE);
  }
}
