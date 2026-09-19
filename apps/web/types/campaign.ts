export type CampaignStatus = 'Active' | 'Paused' | 'Draft' | 'Completed';

export interface RetentionCampaign {
  id: string;
  name: string;
  trigger: string;
  audience: string;
  status: CampaignStatus;
  sentCount: number;
  openedCount: number;
  engagedCount: number;
  recoveredCount: number;
  recoveredRevenue: number;
  conversionRate: number; // percentage
  createdAt: string;
  description: string;
}
