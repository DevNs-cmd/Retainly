import { apiFetch } from './api-client';

export type PlanTier = 'STARTER' | 'GROWTH' | 'PRO' | 'AGENCY';

export interface BillingUsageData {
  period: string;
  students: number;
  courses: number;
  emails: number;
}

export interface BillingLimitsData {
  students: number;
  courses: number;
  emails: number;
}

export interface BackendBillingSubscription {
  planTier: PlanTier;
  subscription: {
    id: string;
    status: string;
    currentPeriodEnd?: string;
    cancelAtPeriodEnd?: boolean;
  } | null;
  usage: BillingUsageData;
  limits: BillingLimitsData;
}

export interface SubscriptionPlanUI {
  id: string;
  tier: PlanTier;
  name: string;
  price: string;
  period: string;
  description: string;
  isPopular?: boolean;
  features: string[];
}

export const SUBSCRIPTION_PLANS: SubscriptionPlanUI[] = [
  {
    id: 'plan_starter',
    tier: 'STARTER',
    name: 'Starter Plan',
    price: '$29',
    period: '/ month',
    description: 'Essential retention tracking for emerging educators and solo coaches.',
    features: [
      'Up to 100 Active Students',
      'Up to 5 Courses',
      '1,000 Retention Emails / mo',
      'Basic At-Risk Detection',
    ],
  },
  {
    id: 'plan_growth',
    tier: 'GROWTH',
    name: 'Growth Plan',
    price: '$79',
    period: '/ month',
    description: 'Advanced automation and team coaching workflows for growing academies.',
    features: [
      'Up to 1,000 Active Students',
      'Up to 25 Courses',
      '10,000 Retention Emails / mo',
      'Automated Intervention Rules',
      'Slack & Webhook Integrations',
    ],
  },
  {
    id: 'plan_pro',
    tier: 'PRO',
    name: 'Pro Plan',
    price: '$199',
    period: '/ month',
    isPopular: true,
    description: 'Full AI-powered predictive churn engine with SMS & personalized outreach.',
    features: [
      'Up to 5,000 Active Students',
      'Up to 100 Courses',
      '50,000 Emails & SMS Outreach',
      'Deep AI Predictive Risk Engine',
      'Priority Coach Task Routing',
    ],
  },
  {
    id: 'plan_agency',
    tier: 'AGENCY',
    name: 'Agency Plan',
    price: '$499',
    period: '/ month',
    description: 'High-scale multi-school retention intelligence with custom modeling.',
    features: [
      'Up to 25,000 Active Students',
      'Up to 500 Courses',
      '250,000 Outreach Messages / mo',
      'Dedicated Retention Architect',
      'Custom AI Training Weights',
    ],
  },
];

export class BillingService {
  static async getSubscription(): Promise<BackendBillingSubscription> {
    return apiFetch<BackendBillingSubscription>('billing/subscription');
  }

  static async getUsage(): Promise<BillingUsageData> {
    return apiFetch<BillingUsageData>('billing/usage');
  }

  static async getInvoices(): Promise<any> {
    return apiFetch<any>('billing/invoices');
  }

  static async createCheckout(planTier: PlanTier): Promise<{ url: string }> {
    return apiFetch<{ url: string }>('billing/checkout', {
      method: 'POST',
      body: JSON.stringify({ planTier, requestId: `req-${Date.now()}` }),
    });
  }

  static async openCustomerPortal(): Promise<{ url: string }> {
    return apiFetch<{ url: string }>('billing/portal', {
      method: 'POST',
    });
  }
}
