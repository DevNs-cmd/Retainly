import { apiFetch } from './api-client';

export interface BackendStudentActivity {
  id: string;
  organizationId: string;
  studentId: string;
  activityType: string;
  source: string;
  payload: Record<string, any>;
  occurredAt: string;
  createdAt: string;
}

export interface PaginatedActivities {
  data: BackendStudentActivity[];
  total: number;
  page: number;
  limit: number;
}

export interface ListActivitiesParams {
  page?: number;
  limit?: number;
  studentId?: string;
  type?: string;
}

export class ActivitiesService {
  static async getActivities(params?: ListActivitiesParams): Promise<BackendStudentActivity[]> {
    try {
      const res = await apiFetch<PaginatedActivities>('activities', {
        params: {
          limit: params?.limit || 10,
          ...(params?.page ? { page: params.page } : {}),
          ...(params?.studentId ? { studentId: params.studentId } : {}),
          ...(params?.type ? { type: params.type } : {}),
        },
      });
      return res?.data || [];
    } catch (err) {
      console.error('Failed to fetch activities:', err);
      return [];
    }
  }
}
