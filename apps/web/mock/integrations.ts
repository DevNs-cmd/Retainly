import { IntegrationItem } from '../types/integration';

export const MOCK_INTEGRATIONS: IntegrationItem[] = [
  {
    id: 'int-1',
    name: 'Kajabi',
    category: 'Course Platforms',
    description: 'Sync student progress, enrollments, and video watch metrics automatically.',
    logo: '🎓',
    connected: true,
    lastSynced: '10 mins ago',
    badge: 'Popular'
  },
  {
    id: 'int-2',
    name: 'Teachable',
    category: 'Course Platforms',
    description: 'Import students, quiz results, and completion status in real-time.',
    logo: '📖',
    connected: false
  },
  {
    id: 'int-3',
    name: 'Thinkific',
    category: 'Course Platforms',
    description: 'Seamless integration for course analytics and student engagement metrics.',
    logo: '💡',
    connected: false
  },
  {
    id: 'int-4',
    name: 'ConvertKit',
    category: 'Email',
    description: 'Trigger targeted win-back email sequences and tag at-risk subscribers.',
    logo: '✉️',
    connected: true,
    lastSynced: '25 mins ago',
    badge: 'Connected'
  },
  {
    id: 'int-5',
    name: 'ActiveCampaign',
    category: 'Email',
    description: 'Automate multi-channel recovery workflows based on AI churn risk scores.',
    logo: '🚀',
    connected: false
  },
  {
    id: 'int-6',
    name: 'Stripe',
    category: 'Payments',
    description: 'Monitor subscription renewal dates, failed payments, and MRR at risk.',
    logo: '💳',
    connected: true,
    lastSynced: 'Just now',
    badge: 'Core'
  },
  {
    id: 'int-7',
    name: 'Slack',
    category: 'Communication',
    description: 'Receive instant notifications when a student enters CRITICAL churn risk.',
    logo: '💬',
    connected: true,
    lastSynced: '1 hour ago'
  }
];
