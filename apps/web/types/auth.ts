export type UserRole = 'OWNER' | 'ADMIN' | 'COACH' | 'STUDENT';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: UserRole;
  academyName: string;
  title: string;
}

export const MOCK_USER_PROFILES: Record<UserRole, UserProfile> = {
  OWNER: {
    id: 'u-owner',
    name: 'Alex Morgan',
    email: 'alex@retainly.io',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    role: 'OWNER',
    academyName: 'Acme Academy',
    title: 'Academy Owner & Founder'
  },
  ADMIN: {
    id: 'u-admin',
    name: 'Elena Rostova',
    email: 'elena@retainly.io',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    role: 'ADMIN',
    academyName: 'Acme Academy',
    title: 'Workspace Administrator'
  },
  COACH: {
    id: 'u-coach',
    name: 'David Miller',
    email: 'david@retainly.io',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    role: 'COACH',
    academyName: 'Acme Academy',
    title: 'Lead Retention Coach'
  },
  STUDENT: {
    id: 'u-student',
    name: 'Sarah Johnson',
    email: 'sarah.j@example.com',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    role: 'STUDENT',
    academyName: 'Acme Academy',
    title: 'Enrolled Student'
  }
};
