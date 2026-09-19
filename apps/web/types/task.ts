export type TaskPriority = 'High' | 'Medium' | 'Low';
export type TaskStatus = 'Pending' | 'Completed' | 'In Progress';

export interface CoachTask {
  id: string;
  title: string;
  studentId: string;
  studentName: string;
  studentAvatar: string;
  course: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueTime: string; // e.g. "Today · 2:00 PM"
  coachAssigned: string;
  notes?: string;
}
