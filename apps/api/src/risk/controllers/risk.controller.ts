import { Controller, Get } from '@nestjs/common';
@Controller('risk')
export class RiskController {
  @Get('scores')
  async getScores() { return []; }
}
