import { BillingUsage, SubscriptionPlan } from '../types/billing';
import { MOCK_BILLING_USAGE, MOCK_SUBSCRIPTION_PLANS } from '../mock/billing';
import { simulateApiCall } from './api-client';

export class BillingService {
  static async getUsage(): Promise<BillingUsage> {
    return simulateApiCall(MOCK_BILLING_USAGE);
  }

  static async getPlans(): Promise<SubscriptionPlan[]> {
    return simulateApiCall(MOCK_SUBSCRIPTION_PLANS);
  }
}
