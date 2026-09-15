import { Injectable,BadRequestException } from '@nestjs/common';import { ConfigService } from '@nestjs/config';import { Job } from 'bullmq';import { DatabaseService } from '../../data/database.service';import { NotificationService } from '../../notifications/notifications.service';import { OutboxService } from '../../outbox/outbox.service';import { ProviderHttp } from '../../integrations/provider-http.service';import { BillingService } from '../../billing/billing.service';import { CampaignStatus,Action,ActionType,Channel } from '../../data/entities';import { JobEnvelope,envelope,requiredString,stableId } from '../job-envelope';
@Injectable()export class NotificationProcessor{
 constructor(private readonly db:DatabaseService,private readonly notifications:NotificationService,private readonly outbox:OutboxService,private readonly http:ProviderHttp,private readonly config:ConfigService,private readonly billing:BillingService){}
 async process(job:Job<JobEnvelope>){
   const {organizationId:org,eventId,payload}=envelope(job);
   if(job.name==='campaign.scheduled')return this.campaign(org,requiredString(payload,'campaignId'),requiredString(payload,'scheduledAt'),eventId);
   if(job.name==='payment.failed')return this.notifications.ownerAlert(org,'Payment failed','A student payment failed. Review the payment feed.',eventId);
   if(job.name==='automation.action.requested'){
     const action=payload.action as unknown as Action;const studentId=requiredString(payload,'studentId');
     if(action.type===ActionType.ADD_TO_CAMPAIGN)return this.campaignRecipient(org,action.config.campaignId!,studentId,eventId);
     if(action.type===ActionType.WEBHOOK){
       const endpoints=JSON.parse(this.config.get<string>('AUTOMATION_WEBHOOK_ENDPOINTS_JSON')||'{}') as Record<string,{url:string;token:string}>;
       const endpoint=endpoints[action.config.endpointKey!];if(!endpoint)throw new BadRequestException('Automation endpoint not configured');
       if(await this.db.first('consumerReceipt',org,{consumer:'webhook-action',eventId}))return;
       await this.http.request(endpoint.url,{method:'POST',headers:{'content-type':'application/json',authorization:'Bearer '+endpoint.token,'Idempotency-Key':eventId},body:JSON.stringify({organizationId:org,studentId,eventId})});
       await this.db.once(org,'webhook-action',eventId,async()=>undefined);return;
     }
     return this.deliver(org,eventId,{...action.config,studentId,channel:action.type.replace('SEND_','')},job.attemptsMade);
   }
   if(job.name==='notification.send'||['SEND_EMAIL','SEND_SMS','SEND_SLACK'].includes(job.name))return this.deliver(org,eventId,{...payload,...(job.name.startsWith('SEND_')?{channel:job.name.slice(5)}:{})},job.attemptsMade);
   throw new BadRequestException('Unknown notification job');
 }
 private async campaign(org:string,id:string,scheduledAt:string,eventId:string){
   const campaign=await this.db.require('campaign',org,id);
   if(campaign.archivedAt||campaign.status===CampaignStatus.PAUSED||campaign.status===CampaignStatus.COMPLETED||campaign.scheduledAt?.toISOString()!==scheduledAt)return;
   if(new Date(scheduledAt).getTime()>Date.now()+1000)throw new BadRequestException('Campaign is not due');
   await this.db.update('campaign',org,id,{status:CampaignStatus.RUNNING});
   let cursor:string|undefined;
   while(true){
     const students=await this.db.list('student',org,{deletedAt:null,...(campaign.segment?{segment:campaign.segment}:{}),...(cursor?{id:{gt:cursor}}:{})},{take:100,orderBy:{id:'asc'}});
     for(const student of students)await this.campaignRecipient(org,id,student.id,eventId);
     if(students.length<100)break;cursor=students[students.length-1].id;
   }
   await this.db.update('campaign',org,id,{dispatchCompleted:true});
   await this.finishCampaign(org,id);
 }
 private async campaignRecipient(org:string,campaignId:string,studentId:string,eventId:string){
   const campaign=await this.db.require('campaign',org,campaignId);if(campaign.archivedAt||campaign.status===CampaignStatus.PAUSED)return;
   const student=await this.db.require('student',org,studentId);if(student.deletedAt)return;
   await this.db.once(org,'campaign-recipient',campaignId+'-'+studentId,async tx=>{
     const channels=campaign.type===Channel.MIXED?['EMAIL','SMS']:[campaign.type];
     for(const channel of channels){
       const id=stableId(campaignId,studentId,channel);
       const recipient=await this.db.create('campaignRecipient',org,{id,campaignId,studentId,channel,status:'PENDING'},tx);
       await this.outbox.create({organizationId:org,eventType:'notification.send',payload:{studentId,channel,templateId:campaign.templateId,message:campaign.message||'',campaignRecipientId:recipient.id}},tx);
     }
   });
 }
 private async deliver(org:string,eventId:string,data:Record<string,unknown>,attempt:number){
   const channel=requiredString(data,'channel');
   if(channel==='SMS'&&!await this.billing.checkFeatureAccess(org,'sms'))throw new BadRequestException('SMS requires a higher plan');
   const studentId=typeof data.studentId==='string'?data.studentId:undefined;
   const student=studentId?await this.db.require('student',org,studentId):undefined;
   if(student?.deletedAt)return;
   const recipient=channel==='SLACK'?requiredString(data,'channelId'):typeof data.to==='string'?data.to:channel==='EMAIL'?student?.email:student?.phone;
   if(!recipient)throw new BadRequestException('Notification recipient missing');
   let log=await this.db.first('notificationLog',org,{sourceEventId:eventId});
   if(log?.status==='SENT')return;
   if(!log)log=await this.db.create('notificationLog',org,{id:stableId(org,'delivery',eventId),sourceEventId:eventId,channel,recipient,status:'PENDING',attemptCount:attempt+1,templateId:typeof data.templateId==='string'?data.templateId:null});
   try{
     let providerMessageId:string;
     if(channel==='EMAIL')providerMessageId=await this.notifications.sendEmail(org,recipient,requiredString(data,'templateId'),{studentName:student?.name||''},eventId);
     else if(channel==='SMS')providerMessageId=await this.notifications.sendSms(org,recipient,requiredString(data,'message'),eventId);
     else if(channel==='SLACK')providerMessageId=await this.notifications.sendSlack(org,recipient,requiredString(data,'message'),eventId);
     else throw new BadRequestException('Unsupported notification channel');
     await this.db.transaction(async tx=>{
       await this.db.update('notificationLog',org,log!.id,{status:'SENT',providerMessageId,sentAt:new Date(),attemptCount:attempt+1},tx);
       if(typeof data.campaignRecipientId==='string')await this.db.update('campaignRecipient',org,data.campaignRecipientId,{status:'SENT',sentAt:new Date()},tx);
     });
     if(channel==='EMAIL')await this.billing.trackUsage(org,'emails',1,eventId);
     if(typeof data.campaignRecipientId==='string'){const row=await this.db.require('campaignRecipient',org,data.campaignRecipientId);await this.finishCampaign(org,row.campaignId);}
   }catch(error){await this.db.update('notificationLog',org,log.id,{status:attempt>=2?'FAILED':'RETRYING',attemptCount:attempt+1,errorCode:'PROVIDER_DELIVERY_FAILED'});throw error;}
 }
 private async finishCampaign(org:string,id:string){
   const campaign=await this.db.require('campaign',org,id);
   if(campaign.dispatchCompleted&&await this.db.count('campaignRecipient',org,{campaignId:id,status:{in:['PENDING','PROCESSING']}})===0)await this.db.update('campaign',org,id,{status:CampaignStatus.COMPLETED});
 }
 async failed(job:Job<JobEnvelope>){
   if(job.attemptsMade<(job.opts.attempts||3))return;
   const {organizationId:org,eventId,payload}=envelope(job);
   if(typeof payload.campaignRecipientId==='string')await this.db.update('campaignRecipient',org,payload.campaignRecipientId,{status:'FAILED'});
   await this.notifications.ownerAlert(org,'Notification failed','A notification exhausted its delivery retries.',eventId+'-failure');
 }
}

