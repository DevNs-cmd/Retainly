import { Prisma } from '@prisma/client';
export interface ActivityEntity {
  id: string; organizationId: string; studentId: string; activityType: string;
  source: string; payload: Prisma.JsonValue; occurredAt: Date; createdAt: Date;
}
