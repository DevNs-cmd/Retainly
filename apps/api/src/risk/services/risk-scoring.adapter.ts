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
      if (new URL(url).protocol !== 'https:') throw new Error('HTTPS required');
      const response = await fetch(url, { method: 'POST', signal: AbortSignal.timeout(10000),
        headers: { 'content-type': 'application/json', authorization: 'Bearer ' + token },
        body: JSON.stringify(features) });
      if (!response.ok) throw new Error('Scoring request failed');
      const result = await response.json() as RiskResult;
      if (!Number.isFinite(result.score) || result.score < 0 || result.score > 1 ||
          !Number.isFinite(result.confidence) || result.confidence < 0 || result.confidence > 1 ||
          !Array.isArray(result.reasons) || !result.reasons.every(reason => typeof reason === 'string')) throw new Error('Invalid scoring result');
      return { score: result.score, reasons: result.reasons, confidence: result.confidence };
    } catch { throw new ServiceUnavailableException('Risk scoring provider unavailable'); }
  }
}
