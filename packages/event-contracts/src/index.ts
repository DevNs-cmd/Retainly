export interface CanonicalEvent<T = any> { eventId: string; eventType: string; organizationId: string; occurredAt: string; source: string; payload: T; }
