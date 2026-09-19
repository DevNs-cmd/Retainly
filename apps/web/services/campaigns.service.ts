import { RetentionCampaign } from '../types/campaign';
import { MOCK_CAMPAIGNS } from '../mock/campaigns';
import { simulateApiCall } from './api-client';

export class CampaignsService {
  static async getCampaigns(): Promise<RetentionCampaign[]> {
    return simulateApiCall(MOCK_CAMPAIGNS);
  }

  static async getCampaignById(id: string): Promise<RetentionCampaign | undefined> {
    const campaign = MOCK_CAMPAIGNS.find((c) => c.id === id);
    return simulateApiCall(campaign);
  }
}
