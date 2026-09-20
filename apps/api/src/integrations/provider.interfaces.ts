import { Credentials } from './credential-vault';
export interface ExternalRecord { id: string; name?: string; email?: string; studentId?: string; courseId?: string; status?: string; completionPercent?: number; amountMinor?: number; currency?: string; occurredAt?: string; }
export interface ProviderPage { records: ExternalRecord[]; nextCursor?: string; }
export type SyncKind = 'courses'|'students'|'enrollments'|'payments';
export interface ICourseProvider { fetch(kind: SyncKind, credentials: Credentials, cursor?: string): Promise<ProviderPage>; }
export interface IEmailProvider { sendEmail(credentials: Credentials, to: string, templateId: string, data: Record<string, unknown>, idempotencyKey: string): Promise<string>; }
export interface ICommunicationProvider { send(credentials: Credentials, destination: string, message: string, idempotencyKey: string): Promise<string>; }
export interface IPaymentProvider { fetch(kind: SyncKind, credentials: Credentials, cursor?: string): Promise<ProviderPage>; }

