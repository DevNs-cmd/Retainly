import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IRiskScoringService, RiskFeatures, RiskResult } from '../risk.contract';

@Injectable()
export class RiskScoringAdapter implements IRiskScoringService {
  private readonly logger = new Logger(RiskScoringAdapter.name);

  constructor(private readonly config: ConfigService) {}

  async calculate(features: RiskFeatures): Promise<RiskResult> {
    const url = this.config.get<string>('RISK_SCORING_URL');
    const token = this.config.get<string>('RISK_SCORING_TOKEN');

    if (!url || !token) {
      return this.heuristicScore(features);
    }

    try {
      const endpoint = new URL(url);
      if (endpoint.protocol !== 'https:' && !(this.config.get('NODE_ENV') !== 'production' && endpoint.protocol === 'http:' && ['localhost','127.0.0.1'].includes(endpoint.hostname))) {
        throw new Error('HTTPS required');
      }
      const response = await fetch(endpoint, {
        method: 'POST',
        redirect: 'error',
        signal: AbortSignal.timeout(10000),
        headers: { 'content-type': 'application/json', 'X-API-Key': token },
        body: JSON.stringify({
          customer_id: features.studentId,
          tenure_months: features.tenureMonths ?? 0,
          monthly_charges: features.monthlyCharges ?? 0,
          last_login_days: Math.max(0, Math.floor(features.daysSinceLastLogin ?? features.daysSinceLastActivity ?? 0)),
          support_tickets: features.countsByType?.SUPPORT_TICKET ?? 0,
          payment_failures: features.failedPayments ?? 0,
        }),
      });
      if (!response.ok) throw new Error('Scoring request failed with status ' + response.status);
      const result = await response.json() as { customer_id: string; risk_score: number; risk_factors: Array<{ factor: string; impact: string; value: string }> };
      if (result.customer_id !== features.studentId || !Number.isFinite(result.risk_score) || result.risk_score < 0 || result.risk_score > 100 || !Array.isArray(result.risk_factors) || result.risk_factors.some(f => typeof f.factor !== 'string' || typeof f.impact !== 'string' || typeof f.value !== 'string')) {
        throw new Error('Invalid scoring result shape');
      }
      return { score: result.risk_score / 100, reasons: result.risk_factors.map(f => `${f.factor}: ${f.impact} (${f.value})`), confidence: 0 };
    } catch (err) {
      this.logger.warn(`External risk scoring service unavailable, using heuristic fallback: ${(err as Error).message}`);
      return this.heuristicScore(features);
    }
  }

  heuristicScore(features: RiskFeatures): RiskResult {
    const reasons: string[] = [];
    const daysInactive = Math.max(0, Math.floor(features.daysSinceLastLogin ?? features.daysSinceLastActivity ?? 0));
    const inactivityScore = Math.min(daysInactive * 2, 100);
    if (daysInactive > 30) {
      reasons.push(`Low engagement: negative (${daysInactive}d inactive)`);
    }

    const paymentFailures = features.failedPayments ?? 0;
    const paymentScore = Math.min(paymentFailures * 40, 100);
    if (paymentFailures > 0) {
      reasons.push(`Payment failures: negative (${paymentFailures} failed)`);
    }

    const supportTickets = features.countsByType?.SUPPORT_TICKET ?? 0;
    const ticketScore = Math.min(supportTickets * 20, 100);
    if (supportTickets >= 3) {
      reasons.push(`High support tickets: negative (${supportTickets} tickets)`);
    }

    const tenureMonths = features.tenureMonths ?? 0;
    const tenureScore = Math.max(0, 60 - tenureMonths * 2);

    const completions = features.lessonCompletions ?? 0;
    const completionDiscount = Math.min(completions * 5, 50);

    const weightedTotal =
      inactivityScore * 0.30 +
      paymentScore * 0.30 +
      ticketScore * 0.20 +
      tenureScore * 0.10 +
      Math.max(0, 50 - completionDiscount) * 0.10;

    const finalScore = Math.max(0, Math.min(100, Math.round(weightedTotal * 100) / 100));

    if (reasons.length === 0) {
      if (finalScore <= 20) {
        reasons.push('High engagement: positive (active learner)');
      } else {
        reasons.push('Standard activity level');
      }
    }

    return {
      score: finalScore / 100,
      reasons,
      confidence: 0.6,
    };
  }
}
