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
 private oauthProfile(provider:string){
   this.assert(provider);const profile=JSON.parse(this.config.get<string>('OAUTH_PROVIDERS_JSON')||'{}')[provider] as {authorizationUrl:string;tokenUrl:string;clientId:string;clientSecret:string;redirectUri:string;scope:string;authMethod?:string};
   if(!profile?.clientId||!profile.clientSecret)throw new BadRequestException('Use API credentials or configure an OAuth application for '+provider);
   for(const value of [profile.authorizationUrl,profile.tokenUrl,profile.redirectUri])if(new URL(value).protocol!=='https:')throw new BadRequestException('OAuth endpoints require HTTPS');return profile;
 }
 authorize(provider:string,state:string){const p=this.oauthProfile(provider);const url=new URL(p.authorizationUrl);for(const [key,value] of Object.entries({response_type:'code',client_id:p.clientId,redirect_uri:p.redirectUri,scope:p.scope||'',state}))url.searchParams.set(key,value);return {authorizationUrl:url.toString()};}
 async token(provider:string,code?:string,refreshToken?:string):Promise<Credentials>{
  const p=this.oauthProfile(provider);const body=new URLSearchParams(refreshToken?{grant_type:'refresh_token',refresh_token:refreshToken}:{grant_type:'authorization_code',code:code!,redirect_uri:p.redirectUri});
  const headers:Record<string,string>={'content-type':'application/x-www-form-urlencoded'};
  if(p.authMethod==='basic')headers.authorization='Basic '+Buffer.from(p.clientId+':'+p.clientSecret).toString('base64');else{body.set('client_id',p.clientId);body.set('client_secret',p.clientSecret);}
  const result=await this.http.request<{access_token:string;refresh_token?:string;expires_in?:number;ok?:boolean}>(p.tokenUrl,{method:'POST',headers,body});
  if(!result.access_token||result.ok===false)throw new BadGatewayException('OAuth exchange failed');
  return {accessToken:result.access_token,refreshToken:result.refresh_token||refreshToken,expiresAt:result.expires_in?Date.now()+result.expires_in*1000:undefined};
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
   if(provider==='convertkit'){
     const headers:Record<string,string>={'content-type':'application/json',...(credentials.accessToken?{authorization:'Bearer '+credentials.accessToken}:{'X-Kit-Api-Key':credentials.apiKey||''})};
     const result=await this.http.request<{subscribers:Array<{id:number;state:string}>}>('https://api.kit.com/v4/subscribers?email_address='+encodeURIComponent(to)+'&status=all',{headers});
     const subscriber=result.subscribers.find(s=>s.state==='active');if(!subscriber)throw new BadRequestException('Recipient is not an active Kit subscriber');
     if(!/^sequence:[1-9][0-9]*$/.test(templateId))throw new BadRequestException('Kit templateId must be sequence:<id>');
     await this.http.request('https://api.kit.com/v4/sequences/'+templateId.slice(9)+'/subscribers/'+subscriber.id,{method:'POST',headers,body:'{}'});return 'sequence-'+templateId.slice(9)+'-'+subscriber.id;
   }
   if(provider==='activecampaign'){
     if(!/^automation:[1-9][0-9]*$/.test(templateId))throw new BadRequestException('ActiveCampaign templateId must be automation:<id>');
     if(!credentials.subdomain||!/^[a-z0-9-]+\.api-(?:us[0-9]+|eu[0-9]+)\.com$/.test(credentials.subdomain))throw new BadRequestException('ActiveCampaign account API hostname required');
     const result=await this.http.request<{contactAutomation:{id:string}}>('https://'+credentials.subdomain+'/api/3/contactAutomations',{method:'POST',headers:{'Api-Token':credentials.apiKey||'','content-type':'application/json'},body:JSON.stringify({contactAutomation:{contact_email:to,automation:templateId.slice(11)}})});
     if(!result.contactAutomation?.id)throw new BadGatewayException('Automation was not accepted');return result.contactAutomation.id;
   }
   if(provider==='klaviyo'){
     if(!templateId.startsWith('metric:')||templateId.length<=7)throw new BadRequestException('Klaviyo templateId must be metric:<flow trigger name>');
     await this.http.request('https://a.klaviyo.com/api/events/',{method:'POST',headers:{authorization:credentials.accessToken?'Bearer '+credentials.accessToken:'Klaviyo-API-Key '+credentials.apiKey,revision:'2026-01-15','content-type':'application/json'},body:JSON.stringify({data:{type:'event',attributes:{unique_id:key,properties:data,metric:{data:{type:'metric',attributes:{name:templateId.slice(7)}}},profile:{data:{type:'profile',attributes:{email:to}}}}}})});return key;
   }
   if(provider!=='mailchimp')throw new BadRequestException('Email unsupported by provider');
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

