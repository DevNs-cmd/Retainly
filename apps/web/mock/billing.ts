import { BillingUsage, SubscriptionPlan } from '../types/billing';

export const MOCK_BILLING_USAGE: BillingUsage = {
  studentsCurrent: 3240,
  studentsLimit: 5000,
  campaignsCurrent: 82,
  campaignsLimit: 100,
  automationsCurrent: 24,
  automationsLimit: 50
};

export const MOCK_SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'plan-starter',
    name: 'Starter',
    price: '$49',
    period: '/month',
    description: 'Essential retention tracking for emerging course creators.',
    features: [
      'Up to 1,000 Active Students',
      'Basic AI Churn Detection',
      '3 Automated Campaigns',
      'Email Integration'
    ]
  },
  {
    id: 'plan-growth',
    name: 'Growth',
    price: '$99',
    period: '/month',
    description: 'Full AI intelligence for growing academies and coaching businesses.',
    isCurrent: true,
    isPopular: true,
    features: [
      'Up to 5,000 Active Students',
      'Advanced Predictive Churn AI',
      'Unlimited Automated Campaigns',
      'Kajabi & Stripe Direct Sync',
      'Coach Task Assignment',
      'Priority Email Support'
    ]
  },
  {
    id: 'plan-pro',
    name: 'Pro',
    price: '$249',
    period: '/month',
    description: 'Scale retention across multiple courses and team coaches.',
    features: [
      'Up to 20,000 Active Students',
      'Custom AI Retention Models',
      'Slack Real-time Alerts',
      'Dedicated Customer Success Manager',
      'Custom Webhooks & API Access'
    ]
  },
  {
    id: 'plan-enterprise',
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'Tailored SLA and dedicated AI models for large education enterprises.',
    features: [
      'Unlimited Students',
      'On-premise / Dedicated Cloud Options',
      'SSO & Advanced Security',
      'Quarterly Churn Strategy Audits'
    ]
  }
];
