export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface RiskFactor {
  id: string;
  type: 'decline' | 'warning' | 'stalled';
  label: string;
  impact: 'high' | 'medium' | 'low';
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  type: 'login' | 'lesson_completed' | 'assignment_submitted' | 'email_opened' | 'risk_increased' | 'coach_note';
  title: string;
  description?: string;
  meta?: Record<string, any>;
}

export interface Student {
  id: string;
  name: string;
  email: string;
  avatar: string;
  course: string;
  courseId: string;
  riskScore: number; // 0 to 100
  riskLevel: RiskLevel;
  riskExplanation: string;
  riskFactors: RiskFactor[];
  completionRate: number; // percentage
  lastActive: string; // relative timestamp e.g. "4 days ago"
  lastActiveDate: string;
  enrolledDate: string;
  status: 'Active' | 'At Risk' | 'Churned' | 'Recovered';
  coachAssigned?: string;
  subscriptionEnd?: string;
  timeline: ActivityLog[];
}
