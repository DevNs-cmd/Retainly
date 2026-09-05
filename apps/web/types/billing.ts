export interface BillingUsage {
  studentsCurrent: number;
  studentsLimit: number;
  campaignsCurrent: number;
  campaignsLimit: number;
  automationsCurrent: number;
  automationsLimit: number;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: string;
  period: string;
  description: string;
  isPopular?: boolean;
  isCurrent?: boolean;
  features: string[];
}
