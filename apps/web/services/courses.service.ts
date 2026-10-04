import { apiFetch } from './api-client';

export interface BackendCourse {
  id: string;
  organizationId: string;
  name: string;
  description?: string | null;
  provider?: string | null;
  externalId?: string | null;
  integrationConnectionId?: string | null;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedCoursesResult {
  data: BackendCourse[];
  total: number;
  page: number;
  limit: number;
}

export interface CourseCardUI {
  id: string;
  title: string;
  description: string;
  instructor: string;
  studentsCount: number;
  completionRate: number;
  retentionRate: number;
  atRiskCount: number;
  revenueAtRisk: string;
}

export class CoursesService {
  static async getCourses(): Promise<CourseCardUI[]> {
    const res = await apiFetch<PaginatedCoursesResult>('courses');
    if (res && Array.isArray(res.data)) {
      return res.data.map((c) => ({
        id: c.id,
        title: c.name,
        description: c.description || 'Structured learning curriculum.',
        instructor: 'Workspace Coach',
        studentsCount: 1,
        completionRate: 64,
        retentionRate: 88.5,
        atRiskCount: 0,
        revenueAtRisk: '$0',
      }));
    }
    return [];
  }

  static async createCourse(name: string, description?: string): Promise<BackendCourse> {
    return apiFetch<BackendCourse>('courses', {
      method: 'POST',
      body: JSON.stringify({ name, description }),
    });
  }

  static async deleteCourse(id: string): Promise<void> {
    await apiFetch(`courses/${id}`, {
      method: 'DELETE',
    });
  }
}
