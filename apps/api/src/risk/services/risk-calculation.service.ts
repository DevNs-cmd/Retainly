import { Inject, Injectable } from '@nestjs/common';
import { IRiskScoringService, RISK_SCORING_SERVICE } from '../risk.contract';
import { ActivityFeaturesExtractor } from '../feature-engineering/activity-features.extractor';
@Injectable()
export class RiskCalculationService {
  constructor(private readonly features: ActivityFeaturesExtractor, @Inject(RISK_SCORING_SERVICE) private readonly scoring: IRiskScoringService) {}
  async calculateStudentRisk(studentId: string, organizationId: string) {
    return this.scoring.calculate(await this.features.extract(studentId, organizationId));
  }
}
