import { RetentionCampaign, CampaignStatus } from '../types/campaign';
import { apiFetch } from './api-client';

export interface BackendCampaign {
  id: string;
  organizationId: string;
  name: string;
  type: 'EMAIL' | 'SMS' | 'MIXED';
  status: 'DRAFT' | 'SCHEDULED' | 'RUNNING' | 'PAUSED' | 'COMPLETED';
  segment?: string | null;
  templateId: string;
  message?: string | null;
  scheduledAt?: string | null;
  archivedAt?: string | null;
  dispatchCompleted?: boolean;
  createdAt: string;
  updatedAt: string;
  stats?: {
    sent: number;
    opened: number;
    converted: number;
  };
}

export interface PaginatedCampaignsResult {
  data: BackendCampaign[];
  total: number;
  page: number;
  limit: number;
}

export function mapBackendCampaignToFrontend(b: BackendCampaign): RetentionCampaign {
  let status: CampaignStatus = 'Draft';
  if (b.status === 'RUNNING' || b.status === 'SCHEDULED') {
    status = 'Active';
  } else if (b.status === 'PAUSED') {
    status = 'Paused';
  } else if (b.status === 'COMPLETED') {
    status = 'Completed';
  }

  const sent = b.stats?.sent ?? 0;
  const opened = b.stats?.opened ?? 0;
  const converted = b.stats?.converted ?? 0;
  const conversionRate = sent > 0 ? Math.round((converted / sent) * 100) : 0;
  const recoveredRevenue = converted * 149; // estimated average course recovered value

  return {
    id: b.id,
    name: b.name,
    trigger: b.segment ? `Segment: ${b.segment}` : 'Behavioral Risk Inactivity',
    audience: b.segment ? `${b.segment} Learners` : 'At-Risk Students',
    status,
    sentCount: sent,
    openedCount: opened,
    engagedCount: opened,
    recoveredCount: converted,
    recoveredRevenue,
    conversionRate,
    createdAt: b.createdAt ? b.createdAt.split('T')[0] : '2026-01-01',
    description: b.message || 'Automated AI retention sequence triggered by behavioral drops.',
    type: b.type,
  };
}

export class CampaignsService {
  static async getCampaigns(page = 1, limit = 50): Promise<RetentionCampaign[]> {
    const res = await apiFetch<PaginatedCampaignsResult>('campaigns', {
      params: { page, limit },
    });
    if (res && Array.isArray(res.data)) {
      return res.data.map(mapBackendCampaignToFrontend);
    }
    return [];
  }

  static async getCampaignById(id: string): Promise<RetentionCampaign> {
    const res = await apiFetch<BackendCampaign>(`campaigns/${id}`);
    return mapBackendCampaignToFrontend(res);
  }

  static async createCampaign(payload: {
    name: string;
    type?: 'EMAIL' | 'SMS' | 'MIXED';
    templateId?: string;
    segment?: string;
    message?: string;
  }): Promise<RetentionCampaign> {
    const body = {
      name: payload.name,
      type: payload.type || 'EMAIL',
      templateId: payload.templateId || 'tmpl-retention-v1',
      ...(payload.segment ? { segment: payload.segment } : {}),
      ...(payload.message ? { message: payload.message } : {}),
    };

    const res = await apiFetch<BackendCampaign>('campaigns', {
      method: 'POST',
      body: JSON.stringify(body),
    });
    return mapBackendCampaignToFrontend(res);
  }

  static async deleteCampaign(id: string): Promise<void> {
    await apiFetch(`campaigns/${id}`, {
      method: 'DELETE',
    });
  }

  static async pauseCampaign(id: string): Promise<BackendCampaign> {
    return apiFetch<BackendCampaign>(`campaigns/${id}/pause`, {
      method: 'POST',
    });
  }

  static async resumeCampaign(id: string): Promise<BackendCampaign> {
    return apiFetch<BackendCampaign>(`campaigns/${id}/resume`, {
      method: 'POST',
    });
  }

  static async sendCampaign(id: string): Promise<BackendCampaign> {
    return apiFetch<BackendCampaign>(`campaigns/${id}/send`, {
      method: 'POST',
    });
  }
}

