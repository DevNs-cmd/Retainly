import { NormalizedWebhook } from '../../webhooks/normalizers/provider-normalizer';
export interface WebhookJobData { organizationId:string;provider:string;eventId:string;normalized:NormalizedWebhook;idempotencyKey:string; }

