import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IRiskScoringService, RiskFeatures, RiskResult } from '../risk.contract';
@Injectable()
export class RiskScoringAdapter implements IRiskScoringService {
  constructor(private readonly config: ConfigService) {}
  async calculate(features: RiskFeatures): Promise<RiskResult> {
    const url = this.config.get<string>('RISK_SCORING_URL');
    const token = this.config.get<string>('RISK_SCORING_TOKEN');
    if (!url || !token) throw new ServiceUnavailableException('Risk scoring provider not configured');
    try {
      const endpoint = new URL(url);
      if (endpoint.protocol !== 'https:' && !(this.config.get('NODE_ENV') !== 'production' && endpoint.protocol === 'http:' && ['localhost','127.0.0.1'].includes(endpoint.hostname))) throw new Error('HTTPS required');
      const response = await fetch(endpoint, { method: 'POST', redirect:'error', signal: AbortSignal.timeout(10000),
        headers: { 'content-type': 'application/json', 'X-API-Key': token },
        body: JSON.stringify({ customer_id:features.studentId, tenure_months:features.tenureMonths ?? 0,
          monthly_charges:features.monthlyCharges ?? 0, last_login_days:Math.max(0,Math.floor(features.daysSinceLastLogin ?? features.daysSinceLastActivity ?? 0)),
          support_tickets:features.countsByType.SUPPORT_TICKET ?? 0, payment_failures:features.failedPayments }) });
      if (!response.ok) throw new Error('Scoring request failed');
      const result = await response.json() as { customer_id:string; risk_score:number; risk_factors:Array<{factor:string;impact:string;value:string}> };
      if (result.customer_id !== features.studentId || !Number.isFinite(result.risk_score) || result.risk_score < 0 || result.risk_score > 100 || !Array.isArray(result.risk_factors) || result.risk_factors.some(f=>typeof f.factor!=='string'||typeof f.impact!=='string'||typeof f.value!=='string')) throw new Error('Invalid scoring result');
      // The supplied AI service does not report confidence. Zero means unreported, not calibrated certainty.
      return { score: result.risk_score / 100, reasons:result.risk_factors.map(f=>`${f.factor}: ${f.impact} (${f.value})`), confidence:0 };
    } catch { throw new ServiceUnavailableException('Risk scoring provider unavailable'); }
  }
}
