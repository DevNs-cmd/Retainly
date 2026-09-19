import { IntegrationItem } from '../types/integration';
import { MOCK_INTEGRATIONS } from '../mock/integrations';
import { simulateApiCall } from './api-client';

export class IntegrationsService {
  static async getIntegrations(): Promise<IntegrationItem[]> {
    return simulateApiCall(MOCK_INTEGRATIONS);
  }
}
