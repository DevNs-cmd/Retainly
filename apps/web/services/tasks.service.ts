import { CoachTask, TaskPriority, TaskStatus } from '../types/task';
import { apiFetch, getAuthUser } from './api-client';

export interface BackendCoachTask {
  id: string;
  organizationId: string;
  studentId: string;
  coachId: string;
  automationRuleId?: string | null;
  title: string;
  notes?: string | null;
  status: 'PENDING' | 'IN_PROGRESS' | 'DONE' | 'SNOOZED';
  dueDate?: string | null;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  student?: {
    id: string;
    name: string;
    email: string;
  } | null;
}

export interface PaginatedCoachTasksResult {
  data: BackendCoachTask[];
  total: number;
  page: number;
  limit: number;
}

export type FrontendCoachTask = CoachTask & { completed: boolean; rawStatus: string };

export function mapBackendTaskToFrontend(
  t: BackendCoachTask,
  studentMap?: Record<string, { name: string; email?: string }>
): FrontendCoachTask {
  const isDone = t.status === 'DONE';
  const studentInfo = studentMap ? studentMap[t.studentId] : undefined;
  const name = studentInfo?.name || t.student?.name || `Student #${t.studentId.slice(0, 8)}`;

  let mappedStatus: TaskStatus = 'Pending';
  if (isDone) {
    mappedStatus = 'Completed';
  } else if (t.status === 'IN_PROGRESS') {
    mappedStatus = 'In Progress';
  }

  return {
    id: t.id,
    title: t.title,
    studentId: t.studentId,
    studentName: name,
    studentAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    course: 'Retention Intervention Sequence',
    priority: 'High',
    status: mappedStatus,
    dueTime: t.dueDate ? new Date(t.dueDate).toLocaleDateString() : 'Today',
    coachAssigned: t.coachId,
    notes: t.notes || undefined,
    completed: isDone,
    rawStatus: t.status,
  };
}

export class TasksService {
  static async getTasks(page = 1, limit = 50): Promise<BackendCoachTask[]> {
    const res = await apiFetch<PaginatedCoachTasksResult>('coach-tasks', {
      params: { page, limit },
    });
    if (res && Array.isArray(res.data)) {
      return res.data;
    }
    return [];
  }

  static async createTask(data: {
    title: string;
    studentId: string;
    coachId?: string;
    notes?: string;
    dueDate?: string;
  }): Promise<BackendCoachTask> {
    const user = getAuthUser();
    const coachId = data.coachId || user?.sub || 'user-owner-1';

    const payload = {
      title: data.title,
      studentId: data.studentId,
      coachId,
      notes: data.notes,
      ...(data.dueDate ? { dueDate: new Date(data.dueDate).toISOString() } : {}),
    };

    return apiFetch<BackendCoachTask>('coach-tasks', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  static async updateTaskStatus(
    id: string,
    status: 'PENDING' | 'IN_PROGRESS' | 'DONE' | 'SNOOZED'
  ): Promise<BackendCoachTask> {
    return apiFetch<BackendCoachTask>(`coach-tasks/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  static async deleteTask(id: string): Promise<void> {
    await apiFetch(`coach-tasks/${id}`, {
      method: 'DELETE',
    });
  }
}
