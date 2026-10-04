import { Student, RiskLevel } from '../types/student';
import { apiFetch } from './api-client';

export interface BackendStudent {
  id: string;
  organizationId: string;
  name: string;
  email: string;
  phone?: string | null;
  provider?: string | null;
  externalId?: string | null;
  assignedCoachId?: string | null;
  segment?: string | null;
  riskScore?: number | null;
  createdAt: string;
  updatedAt: string;
  latestRiskSnapshot?: {
    id: string;
    score: number;
    segment: string;
    reasons?: string[];
  } | null;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export function mapBackendStudentToFrontend(s: BackendStudent): Student {
  let riskLevel: RiskLevel = 'LOW';
  if (s.segment === 'HIGH_RISK') riskLevel = 'HIGH';
  else if (s.segment === 'MEDIUM_RISK') riskLevel = 'MEDIUM';
  else if (s.segment === 'LOW_RISK' || s.segment === 'CHAMPION') riskLevel = 'LOW';

  const riskScoreNormalized = typeof s.riskScore === 'number'
    ? Math.round(s.riskScore <= 1 ? s.riskScore * 100 : s.riskScore)
    : (s.latestRiskSnapshot ? Math.round(s.latestRiskSnapshot.score * 100) : 25);

  return {
    id: s.id,
    name: s.name,
    email: s.email,
    avatar: `https://images.unsplash.com/photo-1534528741775?w=150&auto=format&fit=crop&q=80`,
    course: 'Active Curriculum',
    courseId: 'c-main',
    riskScore: riskScoreNormalized,
    riskLevel,
    riskExplanation: s.latestRiskSnapshot?.reasons?.join(', ') || 'Calculated retention trajectory.',
    riskFactors: [],
    completionRate: 50,
    lastActive: 'Recently',
    lastActiveDate: s.updatedAt || s.createdAt,
    enrolledDate: s.createdAt ? s.createdAt.split('T')[0] : '2026-01-01',
    status: s.segment === 'HIGH_RISK' ? 'At Risk' : 'Active',
    coachAssigned: s.assignedCoachId || 'Staff Coach',
    timeline: [],
  };
}

export class StudentsService {
  static async getStudents(page = 1, limit = 50): Promise<Student[]> {
    const res = await apiFetch<PaginatedResult<BackendStudent>>('students', {
      params: { page, limit },
    });
    if (res && Array.isArray(res.data)) {
      return res.data.map(mapBackendStudentToFrontend);
    }
    return [];
  }

  static async getStudentById(id: string): Promise<Student | undefined> {
    const res = await apiFetch<BackendStudent>(`students/${id}`);
    if (res && res.id) {
      return mapBackendStudentToFrontend(res);
    }
    return undefined;
  }

  static async getAtRiskStudents(): Promise<Student[]> {
    const res = await apiFetch<PaginatedResult<BackendStudent>>('students/at-risk');
    if (res && Array.isArray(res.data)) {
      return res.data.map(mapBackendStudentToFrontend);
    }
    return [];
  }

  static async createStudent(data: { name: string; email: string; phone?: string; assignedCoachId?: string }): Promise<Student> {
    const res = await apiFetch<BackendStudent>('students', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return mapBackendStudentToFrontend(res);
  }

  static async deleteStudent(id: string): Promise<void> {
    await apiFetch(`students/${id}`, {
      method: 'DELETE',
    });
  }
}
