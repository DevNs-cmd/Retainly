import { RetentionCampaign } from '../types/campaign';

export const MOCK_CAMPAIGNS: RetentionCampaign[] = [
  {
    id: 'camp-1',
    name: 'Win Back - 30 Days',
    trigger: 'Inactive for > 14 days',
    audience: 'Inactive Students (Risk > 75)',
    status: 'Active',
    sentCount: 1240,
    openedCount: 824,
    engagedCount: 312,
    recoveredCount: 96,
    recoveredRevenue: 12480,
    conversionRate: 30.7,
    createdAt: '2026-08-01',
    description: 'Automated email nurture sequence with bonus 1-on-1 coaching offer for at-risk students.'
  },
  {
    id: 'camp-2',
    name: 'Course Completion Reminder',
    trigger: 'Module stalled > 7 days',
    audience: 'Low completion rate students',
    status: 'Active',
    sentCount: 890,
    openedCount: 610,
    engagedCount: 245,
    recoveredCount: 78,
    recoveredRevenue: 7800,
    conversionRate: 31.8,
    createdAt: '2026-08-10',
    description: 'Encouraging progress check-in highlighting next immediate 5-minute win lesson.'
  },
  {
    id: 'camp-3',
    name: 'Subscription Renewal Reminder',
    trigger: 'Renewal in 7 days & Low activity',
    audience: 'Expiring subscriptions',
    status: 'Active',
    sentCount: 450,
    openedCount: 380,
    engagedCount: 190,
    recoveredCount: 62,
    recoveredRevenue: 6200,
    conversionRate: 32.6,
    createdAt: '2026-08-15',
    description: 'Targeted discount & VIP community access perk for renewing annual plans.'
  },
  {
    id: 'camp-4',
    name: 'High Risk Intervention',
    trigger: 'Risk Score > 80',
    audience: 'Critical & High Risk Students',
    status: 'Active',
    sentCount: 320,
    openedCount: 280,
    engagedCount: 165,
    recoveredCount: 54,
    recoveredRevenue: 8640,
    conversionRate: 32.7,
    createdAt: '2026-08-20',
    description: 'Direct SMS & coach call scheduling for accounts flagged critical by AI models.'
  }
];
