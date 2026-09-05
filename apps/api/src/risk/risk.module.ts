import { Module } from '@nestjs/common';
import { RiskController } from './controllers/risk.controller';
import { RiskCalculationService } from './services/risk-calculation.service';
import { RiskScoreRepository } from './repositories/risk-score.repository';

@Module({
  controllers: [RiskController],
  providers: [RiskCalculationService, RiskScoreRepository],
  exports: [RiskCalculationService],
})
export class RiskModule {}
