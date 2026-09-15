export enum Role { OWNER = 'OWNER', ADMIN = 'ADMIN', COACH = 'COACH', VIEWER = 'VIEWER' }
export interface AuthUser { userId: string; organizationId: string; role: Role; }
