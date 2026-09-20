import { RiskScoreRepository } from './repositories/risk-score.repository';
import { RiskService } from './services/risk.service';
import { Module } from '@nestjs/common';
import { RiskController } from './controllers/risk.controller';
import { RiskCalculationService } from './services/risk-calculation.service';
import { RiskScoringAdapter } from './services/risk-scoring.adapter';
import { ActivityFeaturesExtractor } from './feature-engineering/activity-features.extractor';
import { RISK_SCORING_SERVICE } from './risk.contract';
@Module({ controllers: [RiskController], providers: [RiskService, RiskScoreRepository,RiskCalculationService, ActivityFeaturesExtractor,
  { provide: RISK_SCORING_SERVICE, useClass: RiskScoringAdapter }],
  exports: [RiskCalculationService, ActivityFeaturesExtractor] })
export class RiskModule {}

