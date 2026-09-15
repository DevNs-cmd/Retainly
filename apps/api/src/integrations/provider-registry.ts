import { Injectable, BadRequestException, BadGatewayException, ServiceUnavailableException } from '@nestjs/common'; import { ConfigService } from '@nestjs/config';
import { ProviderHttp } from './provider-http.service'; import { Credentials } from './credential-vault'; import { ExternalRecord, ProviderPage, SyncKind } from './provider.interfaces';
export const PROVIDERS = ['kajabi','teachable','thinkific','podia','learnworlds','mailchimp','convertkit','activecampaign','klaviyo','stripe','paypal','slack','twilio'] as const;
type ObjectData = Record<string, unknown>;
function object(value: unknown): ObjectData { return value && typeof value === 'object' && !Array.isArray(value) ? value as ObjectData : {}; }
@Injectable() export class ProviderRegistry {
 constructor(private readonly http: ProviderHttp, private readonly config: ConfigService) {}
 assert(provider: string) { if (!(PROVIDERS as readonly string[]).includes(provider)) throw new BadRequestException('Unknown provider'); }
 private bridge(provider: string) {
   this.assert(provider);
   const profiles = JSON.parse(this.config.get<string>('PROVIDER_BRIDGES_JSON') || '{}') as Record<string, { baseUrl: string; token: string }>;
   const profile = profiles[provider]; if (!profile?.baseUrl || !profile.token) throw new ServiceUnavailableException('Provider bridge not configured: ' + provider);
   return profile;
 }
 async bridgeCall<T>(provider: string, operation: string, body: unknown, idempotencyKey?: string) {
   const profile = this.bridge(provider);
   return this.http.request<T>(profile.baseUrl.replace(/\/$/, '') + '/' + operation, { method: 'POST', headers: { authorization: 'Bearer ' + profile.token, 'content-type': 'application/json', ...(idempotencyKey ? {'Idempotency-Key': idempotencyKey} : {}) }, body: JSON.stringify(body) });
 }
 async fetch(provider: string, kind: SyncKind, credentials: Credentials, cursor?: string): Promise<ProviderPage> {
   this.assert(provider);
   if (!['kajabi','teachable','thinkific'].includes(provider) || kind === 'payments' || (provider === 'kajabi' && kind === 'enrollments'))
     return this.bridgeCall<ProviderPage>(provider, 'sync/' + kind, { credentials, cursor });
   const paths: Record<string, Record<string,string>> = {
     kajabi: { courses: 'products', students: 'contacts' }, teachable: { courses: 'courses', students: 'users', enrollments: 'enrollments' },
     thinkific: { courses: 'courses', students: 'users', enrollments: 'enrollments' },
   };
   const base = provider === 'kajabi' ? 'https://api.kajabi.com/v1/' : provider === 'teachable' ? 'https://developers.teachable.com/v1/' : 'https://api.thinkific.com/api/public/v1/';
   const page = Number(cursor || 1); if (!Number.isSafeInteger(page) || page < 1 || page > 100000) throw new BadRequestException('Invalid provider page');
   const headers: Record<string,string> = provider === 'teachable' ? { apiKey: credentials.apiKey || '' } : provider === 'thinkific' ? { 'X-Auth-API-Key': credentials.apiKey || '', 'X-Auth-Subdomain': credentials.subdomain || '' } : { authorization: 'Bearer ' + (credentials.accessToken || credentials.apiKey || '') };
   const result = object(await this.http.request<unknown>(base + paths[provider][kind] + '?page=' + page + '&per_page=100', { headers }));
   const raw = result.data || result.items || result[kind === 'students' ? 'users' : kind];
   if (!Array.isArray(raw)) throw new BadGatewayException('Invalid provider collection');
   const records = raw.map(value => {
     const row = object(value); const attributes = { ...row, ...object(row.attributes) };
     const id = attributes.id || row.id; if (typeof id !== 'string' && typeof id !== 'number') throw new BadGatewayException('Provider record missing ID');
     return { id: String(id), name: String(attributes.name || attributes.title || [attributes.first_name, attributes.last_name].filter(Boolean).join(' ') || ''),
       email: attributes.email ? String(attributes.email) : undefined, studentId: attributes.user_id ? String(attributes.user_id) : undefined,
       courseId: attributes.course_id ? String(attributes.course_id) : undefined, completionPercent: Number(attributes.percent_complete || 0), status: attributes.completed_at ? 'COMPLETED' : 'ACTIVE' } as ExternalRecord;
   });
   return { records, nextCursor: raw.length === 100 ? String(page + 1) : undefined };
 }
 async sendEmail(provider: string, credentials: Credentials, to: string, templateId: string, data: Record<string,unknown>, key: string): Promise<string> {
   if (provider !== 'mailchimp') return (await this.bridgeCall<{ id: string }>(provider, 'send/email', { credentials, to, templateId, data }, key)).id;
   const result = await this.http.request<Array<{ _id: string; status: string }>>('https://mandrillapp.com/api/1.0/messages/send-template.json', {
     method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ key: credentials.apiKey, template_name: templateId, template_content: [],
       message: { from_email: credentials.from, to: [{ email: to, type: 'to' }], global_merge_vars: Object.entries(data).map(([name,content]) => ({ name, content })) } }),
   });
   if (!result[0]?._id || !['sent','queued','scheduled'].includes(result[0].status)) throw new BadGatewayException('Email provider rejected message');
   return result[0]._id;
 }
 async sendSms(credentials: Credentials, to: string, message: string, key: string) {
   if (!credentials.accountId || !credentials.apiKey || !credentials.from) throw new ServiceUnavailableException('SMS credentials incomplete');
   const result = await this.http.request<{ sid: string }>('https://api.twilio.com/2010-04-01/Accounts/' + encodeURIComponent(credentials.accountId) + '/Messages.json', {
     method: 'POST', headers: { authorization: 'Basic ' + Buffer.from(credentials.accountId + ':' + credentials.apiKey).toString('base64'), 'content-type': 'application/x-www-form-urlencoded' },
     body: new URLSearchParams({ To: to, From: credentials.from, Body: message }),
   });
   if (!result.sid) throw new BadGatewayException('SMS provider response invalid'); return result.sid;
 }
 async sendSlack(credentials: Credentials, channel: string, message: string, key: string) {
   const result = await this.http.request<{ ok: boolean; ts: string }>('https://slack.com/api/chat.postMessage', { method: 'POST',
     headers: { authorization: 'Bearer ' + (credentials.accessToken || credentials.apiKey), 'content-type': 'application/json' }, body: JSON.stringify({ channel, text: message, client_msg_id: key }) });
   if (!result.ok) throw new BadGatewayException('Slack rejected message'); return result.ts;
 }
}

