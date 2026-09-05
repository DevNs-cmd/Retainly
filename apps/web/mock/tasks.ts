import { CoachTask } from '../types/task';

export const MOCK_TASKS: CoachTask[] = [
  {
    id: 'task-1',
    title: 'Follow up with Sarah Johnson',
    studentId: '1',
    studentName: 'Sarah Johnson',
    studentAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    course: 'AI Masterclass',
    priority: 'High',
    status: 'Pending',
    dueTime: 'Today · 2:00 PM',
    coachAssigned: 'Alex Morgan',
    notes: 'Risk score spiked to 87. Reach out via email regarding Module 3 completion.'
  },
  {
    id: 'task-2',
    title: 'Contact Rahul Sharma',
    studentId: '2',
    studentName: 'Rahul Sharma',
    studentAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    course: 'Python Bootcamp',
    priority: 'High',
    status: 'Pending',
    dueTime: 'Today · 4:30 PM',
    coachAssigned: 'David Miller',
    notes: 'Skipped 3 Q&A sessions. Send personal invitation for tomorrow office hours.'
  },
  {
    id: 'task-3',
    title: 'Review high-risk cohort students',
    studentId: '4',
    studentName: 'Michael Chen',
    studentAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    course: 'Leadership 101',
    priority: 'Medium',
    status: 'Pending',
    dueTime: 'Tomorrow · 10:00 AM',
    coachAssigned: 'Sarah Jenkins',
    notes: 'Check milestone submission for Leadership cohort 4.'
  }
];
