import { apiFetch } from './api-client';
import { IntegrationCategory, IntegrationItem } from '../types/integration';

export interface BackendIntegrationConnection {
  id: string;
  organizationId: string;
  provider: string;
  status: 'CONNECTED' | 'DISCONNECTED' | 'ERROR';
  config?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProviderCatalogMeta {
  provider: string;
  name: string;
  category: IntegrationCategory;
  description: string;
  logo: string;
  badge?: string;
}

export const SUPPORTED_PROVIDERS: ProviderCatalogMeta[] = [
  {
    provider: 'kajabi',
    name: 'Kajabi',
    category: 'Course Platforms',
    description: 'Sync courses, student progress, quiz events, and churn bottlenecks from Kajabi.',
    logo: '🟦',
    badge: 'Popular',
  },
  {
    provider: 'teachable',
    name: 'Teachable',
    category: 'Course Platforms',
    description: 'Import student enrollments, completion rates, and video activity in real time.',
    logo: '🟢',
  },
  {
    provider: 'thinkific',
    name: 'Thinkific',
    category: 'Course Platforms',
    description: 'Track student curriculum drop-offs and course progress directly from Thinkific.',
    logo: '🔷',
  },
  {
    provider: 'podia',
    name: 'Podia',
    category: 'Course Platforms',
    description: 'Connect courses, memberships, and digital downloads for automated retention.',
    logo: '🟣',
  },
  {
    provider: 'learnworlds',
    name: 'LearnWorlds',
    category: 'Course Platforms',
    description: 'Interactive video learning drop-off tracking and student analytics.',
    logo: '🌐',
  },
  {
    provider: 'convertkit',
    name: 'Kit (ConvertKit)',
    category: 'Email',
    description: 'Trigger targeted email sequences and tag students when AI risk flags rise.',
    logo: '🔴',
    badge: 'Recommended',
  },
  {
    provider: 'mailchimp',
    name: 'Mailchimp',
    category: 'Email',
    description: 'Automate re-engagement email journeys based on Retainly risk scores.',
    logo: '🐵',
  },
  {
    provider: 'activecampaign',
    name: 'ActiveCampaign',
    category: 'Email',
    description: 'Trigger advanced retention automations with custom CRM tags and deals.',
    logo: '⚡',
  },
  {
    provider: 'klaviyo',
    name: 'Klaviyo',
    category: 'Email',
    description: 'Personalized lifecycle retention messaging powered by machine learning signals.',
    logo: '📨',
  },
  {
    provider: 'stripe',
    name: 'Stripe',
    category: 'Payments',
    description: 'Detect failed renewals, card expirations, and subscription churn events.',
    logo: '💳',
    badge: 'Core',
  },
  {
    provider: 'paypal',
    name: 'PayPal',
    category: 'Payments',
    description: 'Track recurring subscription billing and dispute notifications.',
    logo: '🅿️',
  },
  {
    provider: 'slack',
    name: 'Slack',
    category: 'Communication',
    description: 'Send instant alerts to coach channels when a high-value student reaches critical risk.',
    logo: '💬',
  },
  {
    provider: 'twilio',
    name: 'Twilio SMS',
    category: 'Communication',
    description: 'Urgent SMS outreach sequences for students at immediate drop-off risk.',
    logo: '📱',
  },
];

export class IntegrationsService {
  static async getConnectedIntegrations(): Promise<BackendIntegrationConnection[]> {
    const res = await apiFetch<BackendIntegrationConnection[]>('integrations');
    return Array.isArray(res) ? res : [];
  }

  static async getCatalog(): Promise<IntegrationItem[]> {
    const connectedList = await this.getConnectedIntegrations();
    const connectedMap = new Map<string, BackendIntegrationConnection>();
    connectedList.forEach((c) => connectedMap.set(c.provider.toLowerCase(), c));

    return SUPPORTED_PROVIDERS.map((meta) => {
      const conn = connectedMap.get(meta.provider.toLowerCase());
      const isConnected = conn?.status === 'CONNECTED';
      return {
        id: meta.provider,
        name: meta.name,
        category: meta.category,
        description: meta.description,
        logo: meta.logo,
        connected: isConnected,
        badge: meta.badge,
        lastSynced: conn?.updatedAt ? new Date(conn.updatedAt).toLocaleDateString() : undefined,
      };
    });
  }

  static async connect(provider: string, credentials: { apiKey?: string; accessToken?: string }): Promise<any> {
    return apiFetch(`integrations/${provider}/connect`, {
      method: 'POST',
      body: JSON.stringify({ credentials }),
    });
  }

  static async disconnect(provider: string): Promise<any> {
    return apiFetch(`integrations/${provider}/disconnect`, {
      method: 'DELETE',
    });
  }

  static async sync(provider: string): Promise<any> {
    return apiFetch(`integrations/${provider}/sync`, {
      method: 'POST',
    });
  }
}
