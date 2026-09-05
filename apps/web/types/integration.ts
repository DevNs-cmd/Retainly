export type IntegrationCategory = 'Course Platforms' | 'Email' | 'Payments' | 'Communication';

export interface IntegrationItem {
  id: string;
  name: string;
  category: IntegrationCategory;
  description: string;
  logo: string;
  connected: boolean;
  lastSynced?: string;
  badge?: string;
}
